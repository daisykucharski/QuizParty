import express from "express";
import cors from "cors";
import http from "http";
import {Server} from "socket.io";


const app = express();
const server = http.createServer(app)
const io = new Server(server);

// middleware
app.use(cors());


app.listen(5000, () => {
  console.log("server has started on port 5000");
});
