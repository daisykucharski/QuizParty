import { Socket } from "socket.io";
import GameController from "./controller";
const app = require("express")();
const httpServer = require("http").createServer(app);
const options = {
  cors: {
    origin: "*",
  },
};
const io = require("socket.io")(httpServer, options);

const controller = new GameController(io);

io.on("connection", (socket: Socket) => {
  console.log("New client connected");

  // Creates a new game at clients request on the start page
  socket.on("newGame", () => controller.handleNewGame(socket));

  // Allows client to join the given room on the start page
  socket.on("joining", (data) => controller.handleJoining(socket, data));

  // When the display client joins, add them to the room if it exists
  socket.on("newDisplayJoin", (data) =>
    controller.handleNewDisplayJoin(socket, data)
  );

  // When a new player tries to join a game room, either add them to room they're trying
  // to join or redirect them to the starting page
  socket.on("newPlayerJoin", (data) =>
    controller.handleNewPlayerJoin(socket, data)
  );

  // Kicks the given player from the room
  socket.on("kick", (data) => controller.handleKick(data));

  // When the client requests the game to start, start the next round and emit the starting data
  socket.on("start", (data) => controller.handleStart(data));

  socket.on("clueChosen", (data) => controller.handleClueChosen(socket, data));

  socket.on("allowAnswers", () => console.log("Allowing answers now"));

  socket.on("disconnecting", () => controller.handleDisconnect(socket));
});

httpServer.listen(5000, () => console.log("Listening on port 5000"));
