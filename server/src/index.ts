const app = require("express")();
const httpServer = require("http").createServer(app);
const options = {
  cors: {
    origin: "*",
  },
};
const io = require("socket.io")(httpServer, options);

io.on("connection", (socket) => {
  console.log("New client connected");

  socket.on("nextRound", () => {
    const clues = [
      {
        name: "fromAasd",
        clues: [200, null, 600, 800, 1000],
      },
      { name: "abdsfaabdsfa", clues: [200, 400, 600, 800, 1000] },
      { name: "3", clues: [200, 400, 600, 800, 1000] },
      { name: "4", clues: [null, 400, 600, 800, 1000] },
      { name: "5", clues: [200, 400, 600, 800, 1000] },
      { name: "6", clues: [200, 400, 600, 800, 1000] },
    ];

    const players = [
      { name: "1", earnings: 100 },
      { name: "2", earnings: 0 },
      { name: "3", earnings: 200 },
    ];

    const playerInControl = "1";
    const round = 1;

    io.emit("startRound", { clues, players, playerInControl, round });
  });
});
httpServer.listen(5000, () => console.log("Listening on port 5000"));
