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
  socket.on("joining", ({ room }) => {
    if (rooms.has(room)) {
      socket.emit("joinConfirmed");
    } else {
      socket.emit("errorMessage", "No room with that id found");
    }
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
  socket.on("start", () => {
    game.startNextRound().then(() => io.emit("startRound", game.getData()));
  });
});

httpServer.listen(5000, () => console.log("Listening on port 5000"));
