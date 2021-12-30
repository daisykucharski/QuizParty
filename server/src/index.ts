const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
import cors from "cors";


const app = express();
const server = http.createServer(app)
const io = socketIo(server);

// middleware
app.use(cors());

app.listen(5000, () => {
  console.log("server has started on port 5000");
});
