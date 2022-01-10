import { Socket } from "socket.io";
import Game from "./game";
import { Player } from "./types";
import { generateRandomCode } from "./utilities";

class GameController {
  io: any;
  rooms = new Map<string, Game>();

  constructor(io: any) {
    this.io = io;
  }

  /**
   * Allows a client to create a new game and gives them a room code. Ensures that the random room generated is unique
   * @param socket the socket of the client
   */
  handleNewGame = (socket: Socket) => {
    this.makeRoom().then((room) => {
      socket.emit("newGameCreated", room);
    });
  };

  makeRoom = (): Promise<string> => {
    return new Promise<string>((resolve) => {
      var newRoom = generateRandomCode();
      while (this.rooms.has(newRoom)) {
        newRoom = generateRandomCode();
      }
      this.rooms.set(newRoom, new Game());
      resolve(newRoom);
    });
  };

  /**
   * Handles a client requesting to join a game on the starting screen. Verifies that they're trying to join exists
   * and verifies that the name is unique
   * @param socket the socket of the client
   * @param data the room and name of the client trying to join
   */
  handleJoining = (
    socket: Socket,
    { room, name }: { room: string; name: string }
  ): void => {
    const game = this.rooms.get(room);

    if (!game) {
      socket.emit("errorMessage", "No room with that id found");
      return;
    }

    // emsures that all names in the game are unique
    if (game.playerInGame(name)) {
      socket.emit(
        "errorMessage",
        `There is already a player with name ${name}. Please pick another name`
      );
      return;
    }

    socket.emit("joinConfirmed");
  };

  /**
   * Handles letting the display client of a game connect
   * @param socket the socket of the client
   * @param room the room the client is trying to connect to
   * @returns
   */
  handleNewDisplayJoin = (socket: Socket, { room }: { room: string }) => {
    const game = this.rooms.get(room);

    // if the room doesn't exist, then redirect back to starting page
    if (!game) {
      this.io.to(socket.id).emit("joinError");
      return;
    }

    socket.join(room);
    game.setDisplaySocketId(socket.id);
  };

  /**
   * Handles the case of a player trying to join a game once redirected to the player page.
   * Ensures that the room exists, that the player has a name, and that there aren't too many players
   * in the game. Notifies the other clients of the new player
   * @param socket the socket of the client
   * @param data the room and name of the client trying to join
   */
  handleNewPlayerJoin = (
    socket: Socket,
    { room, name }: { room: string; name: string }
  ) => {
    // If someone goes to the game page without a room or name, then redirect
    // them back to the starting page
    if (room === "" || name === "") {
      this.io.to(socket.id).emit("joinError");
      return;
    }

    const game = this.rooms.get(room);

    // if the room doesn't exist, then redirect back to starting page
    if (!game) {
      this.io.to(socket.id).emit("joinError");
      return;
    }

    // If there are already 6 players in the game, then redirect back to starting page
    if (game.getPlayers().length === 6) {
      this.io.to(socket.id).emit("joinError");
      return;
    }

    socket.join(room);
    const newPlayer = { name, earnings: 0, socketid: socket.id };
    game.addPlayer(newPlayer);
    this.io.to(room).emit("newPlayers", { players: game.getPlayers() });
  };

  /**
   * Handles kicking a player from a room.
   * @param data the name of the player and the room they're in
   */
  handleKick = ({ room, player }: { room: string; player: Player }) => {
    console.log(`Kicking ${player.name}`);

    this.io.to(player.socketid).emit("kick", { room, player });

    const game = this.rooms.get(room);
    if (!game) {
      return;
    }
    game.removePlayer(player);
    this.io.to(room).emit("newPlayers", { players: game.getPlayers() });
  };

  /**
   * Handles starting the game being played in a given room
   * @param room the room of the game being started
   */
  handleStart = ({ room }: { room: string }) => {
    const game = this.rooms.get(room);

    if (!game) {
      return;
    }

    // if there aren't any players in the game yet, don't start
    if (game.getPlayers().length < 1) {
      return;
    }

    game
      .startNextRound()
      .then(() => this.io.emit("startRound", game.getData()))
      .then(() => this.io.emit("chooseClue", game.getChooseClueData()));
  };

  handleClueChosen(
    socket: Socket,
    {
      room,
      categoryId,
      questionId,
    }: {
      room: string;
      categoryId: number;
      questionId: number;
    }
  ) {
    console.log("Clue was chosen");

    const game = this.rooms.get(room);

    // invalid room code
    if (!game) {
      return;
    }

    // keep track of the clue chosen by the player
    game.chooseClue(categoryId, questionId);

    // TODO: Determine whether the clue is a daily double or regular question and emit different event accordingly
    console.log("regularQuestion emitting");

    this.io.to(room).emit("regularQuestion", {
      clue: game.getClue(categoryId, questionId).question,
    });
  }

  /**
   * Handles a client disconnecting from the server. Removes them from the room they were in.
   * If the display client disconnects, the other players are disconected as well. If all
   * the players in a game disconnect, then the display client discconects as well.
   * @param socket the socket of the client disconnecting
   */
  handleDisconnect = (socket: Socket) => {
    console.log("Client disconnected");

    // Find the rooms that the socket is connected to
    // the second one is the room for the game
    const connectedRooms = socket.rooms;

    // Finds the game room that the socket is
    const currentRoom = Array.from(connectedRooms.values()).find(
      (room) => room !== socket.id
    );

    // If the socket wasn't in a game room, then we don't need to do
    // anything to disconnect it
    if (!currentRoom) {
      return;
    }

    const game = this.rooms.get(currentRoom);

    if (!game) {
      return;
    }

    // if the display client disconnects, then delete the room and notify the clients of the error
    if (socket.id === game.getDisplaySocketId()) {
      this.io.to(currentRoom).emit("gameError");
      this.rooms.delete(currentRoom);
      return;
    }

    // find the player with the given socket id
    const player = game
      ?.getPlayers()
      .filter((player) => player.socketid === socket.id)[0];

    // if the player doesn't exist, do nothing
    if (!player) {
      return;
    }

    // Remove the player from the game and notify the clients of the change
    game?.removePlayer(player);
    this.io.to(currentRoom).emit("newPlayers", { players: game.getPlayers() });

    // if there are no more players in the game, remove the game from memory
    // and notify the display to return to the starting page
    if (game.getPlayers().length === 0 && this.rooms.has(currentRoom)) {
      this.io.to(currentRoom).emit("gameError");
      this.rooms.delete(currentRoom);
    }
  };
}

export default GameController;
