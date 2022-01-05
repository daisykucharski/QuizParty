import Game from "./game";
import { Player } from "./types";
import { generateRandomCode } from "./utilities";
import { Socket } from "socket.io";
const app = require("express")();
const httpServer = require("http").createServer(app);
const options = {
  cors: {
    origin: "*",
  },
};
const io = require("socket.io")(httpServer, options);

const game = new Game();

// Stores a mapping of room ids to the games being played in each room
const rooms = new Map<string, Game>();

// Promise function to ensure that the room code generated is unique
const makeRoom = new Promise<string>((resolve) => {
  var newRoom = generateRandomCode();
  while (rooms.has(newRoom)) {
    newRoom = generateRandomCode();
  }
  rooms.set(newRoom, new Game());
  resolve(newRoom);
});

io.on("connection", (socket: Socket) => {
  console.log("New client connected");

  // Creates a new game at clients request on the start page
  socket.on("newGame", () => {
    makeRoom.then((room) => {
      socket.emit("newGameCreated", room);
    });
  });

  // Allows client to join the given room on the start page
  socket.on("joining", ({ room, name }) => {
    const game = rooms.get(room);

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
  });

  // When the display client joins, add them to the room if it exists
  socket.on("newDisplayJoin", ({ room }) => {
    const game = rooms.get(room);

    // if the room doesn't exist, then redirect back to starting page
    if (!game) {
      io.to(socket.id).emit("joinError");
      return;
    }

    socket.join(room);
    game.setDisplaySocketId(socket.id);
  });

  // When a new player tries to join a game room, either add them to room they're trying
  // to join or redirect them to the starting page
  socket.on(
    "newPlayerJoin",
    ({ room, name }: { room: string; name: string }) => {
      // If someone goes to the game page without a room or name, then redirect
      // them back to the starting page
      if (room === "" || name === "") {
        io.to(socket.id).emit("joinError");
        return;
      }

      const game = rooms.get(room);

      // if the room doesn't exist, then redirect back to starting page
      if (!game) {
        io.to(socket.id).emit("joinError");
        return;
      }

      // If there are already 6 players in the game, then redirect back to starting page
      if (game.getPlayers().length === 6) {
        io.to(socket.id).emit("joinError");
        return;
      }

      socket.join(room);
      const newPlayer = { name, earnings: 0, socketid: socket.id };
      game.addPlayer(newPlayer);
      io.to(room).emit("newPlayers", { players: game.getPlayers() });
    }
  );

  // Kicks the given player from the room
  socket.on("kick", ({ room, player }: { room: string; player: Player }) => {
    const game = rooms.get(room);
    if (!game) {
      return;
    }
    game.removePlayer(player);
    io.to(room).emit("newPlayers", { players: game.getPlayers() });
  });

  // When the client requests the game to start, start the next round and emit the starting data
  socket.on("start", ({ room }) => {
    const game = rooms.get(room);

    if (!game) {
      return;
    }
    game.startNextRound().then(() => io.emit("startRound", game.getData()));
  });

  socket.on("disconnecting", () => {
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

    const game = rooms.get(currentRoom);

    if (!game) {
      return;
    }

    // if the display client disconnects, then delete the room and notify the clients of the error
    if (socket.id === game.getDisplaySocketId()) {
      io.to(currentRoom).emit("gameError");
      rooms.delete(currentRoom);
      return;
    }

    // find the player with the given socket id
    const player = game
      ?.getPlayers()
      .filter((player) => player.socketid === socket.id)[0];

    // Remove the player from the game and notify the clients of the change
    game?.removePlayer(player);
    io.to(currentRoom).emit("newPlayers", { players: game.getPlayers() });

    // if there are no more players in the game, remove the game from memory
    // and notify the display to return to the starting page
    if (game.getPlayers().length === 0 && rooms.has(currentRoom)) {
      io.to(currentRoom).emit("gameError");
      rooms.delete(currentRoom);
    }
  });
});

httpServer.listen(5000, () => console.log("Listening on port 5000"));
