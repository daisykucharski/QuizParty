import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Socket } from "socket.io-client";
import socketIOClient from "socket.io-client";
import qs from "qs";
import { ViewData, Clues, Player, JeopardyCategory } from "../../types";

import Board from "../functional/Board";
import Header from "../functional/Header";
import Waiting from "../functional/Waiting";

const ENDPOINT = "http://192.168.56.1:5000";

/**
 * This component represents the display page of the application. This is
 * the page that shows the Jeopardy clues
 * @returns the component for the display page
 */
const DisplayPage = () => {
  // state for running the game
  const [socket, setSocket] = useState<Socket | null>(null);
  const [room, setRoom] = useState("");
  const [waiting, setWaiting] = useState(true);

  // State regarding the gameplay
  const [clues, setClues] = useState<Clues>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [playerInControl, setPlayerInControl] = useState<Player>({
    name: "",
    earnings: 0,
  });
  const [round, setRound] = useState(0);

  const navigate = useNavigate();

  // Set the socket state and add all the necessary event listeners
  // Determine the room id from the URL and notify the server that the display has joined
  useEffect(() => {
    const { room } = qs.parse(window.location.search, {
      ignoreQueryPrefix: true,
    });
    setRoom(room as string);

    const socket = socketIOClient(ENDPOINT);
    setSocket(socket);
    socket.on("startRound", handleStartRound);
    socket.on("gameError", () => navigate("/"));
    socket.on("newPlayers", ({ players }: { players: Player[] }) => {
      setPlayers(players);
    });

    socket.emit("newDisplayJoin", { room });

    return () => {
      socket.disconnect();
    };
  }, [navigate]);

  /**
   * Updates the state to reflect the new data for the start of the next round
   * Sets waiting to false because a round has started
   * @param data the data for the start of the round
   */
  const handleStartRound = ({
    clues,
    players,
    playerInControl,
    round,
  }: ViewData) => {
    setClues(clues);
    setPlayers(players);
    setPlayerInControl(playerInControl);
    setRound(round);
    setWaiting(false);
  };

  if (waiting) {
    return (
      <Waiting
        room={room}
        players={players}
        handleStart={() => socket?.emit("start", { room })}
        kick={(player: Player) => socket?.emit("kick", { room, player })}
      />
    );
  }

  return (
    <>
      <Header round={round} />
      {round > 0 ? (
        round < 3 ? (
          <Board clues={clues as JeopardyCategory[]} />
        ) : (
          "Display Final Jeopardy! clue"
        )
      ) : (
        ""
      )}

      <div className="leaderboard">
        <p>Leaderboard:</p>
        {players.map((player, index) => {
          return (
            <div className="player-score" key={index}>
              <p>
                {player.name} | ${player.earnings}
              </p>
            </div>
          );
        })}
      </div>
      <p>{playerInControl && playerInControl.name}, you're in control</p>
    </>
  );
};

export default DisplayPage;
