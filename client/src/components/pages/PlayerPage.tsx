import React, { useEffect, useState } from "react";
import socketIOClient from "socket.io-client";
import qs from "qs";
import { Socket } from "socket.io-client";
import { useNavigate } from "react-router-dom";
import { Player, ViewData } from "../../types";

const ENDPOINT = "http://192.168.56.1:5000";

const PlayerPage = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [room, setRoom] = useState("");
  const [name, setName] = useState("");
  const [waiting, setWaiting] = useState(true);

  const [player, setPlayer] = useState<Player>({ name: "", earnings: 0 });

  const navigate = useNavigate();

  // Set the socket state and add all the necessary event listeners
  // Determine the room id from the URL and notify the server that the display has joined
  useEffect(() => {
    const { room, name } = qs.parse(window.location.search, {
      ignoreQueryPrefix: true,
    });
    setRoom(room as string);
    setName(name as string);

    const socket = socketIOClient(ENDPOINT);
    setSocket(socket);

    socket.on("gameError", () => navigate("/"));
    socket.on("startRound", handleStartRound);
    socket.on("kick", handleKick);

    socket.emit("newPlayerJoin", { room, name });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleKick = ({ player }: { room: string; player: Player }) => {
    if (player.name === name) {
      navigate("/");
    }
  };

  const handleStartRound = (data: ViewData) => {
    const { players } = data;
    const updatedPlayer = players.filter((player) => player.name === name)[0];
    setPlayer(updatedPlayer);
  };

  if (waiting) {
    return (
      <div>
        <h2>{name}</h2>
        <p>Waiting for game to start</p>
      </div>
    );
  }

  return <div></div>;
};

export default PlayerPage;
