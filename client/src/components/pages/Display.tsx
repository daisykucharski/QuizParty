import React, { useEffect, useState } from "react";
import socketIOClient from "socket.io-client";

import Board from "../functional/Board";
import Header from "../functional/Header";

const ENDPOINT = "http://192.168.56.1:5000";

const Display = () => {
  useEffect(() => {
    const socket = socketIOClient(ENDPOINT);
    socket.emit("nextRound");
    socket.on("startRound", handleStartRound);

    return () => {
      socket.disconnect();
    };
  }, []);

  const exampleClues = [
    {
      name: "abdsfa",
      clues: [200, null, 600, 800, 1000],
    },
    { name: "abdsfaabdsfa", clues: [200, 400, 600, 800, 1000] },
    { name: "3", clues: [200, 400, 600, 800, 1000] },
    { name: "4", clues: [null, 400, 600, 800, 1000] },
    { name: "5", clues: [200, 400, 600, 800, 1000] },
    { name: "6", clues: [200, 400, 600, 800, 1000] },
  ];

  const [clues, setClues] = useState(exampleClues);
  const [players, setPlayers] = useState([]);
  const [playerInControl, setPlayerInControl] = useState(null);
  const [round, setRound] = useState(0);

  const handleStartRound = ({ clues, players, playerInControl, round }) => {
    setClues(clues);
    setPlayers(players);
    setPlayerInControl(playerInControl);
    setRound(round);
  };

  return (
    <>
      <Header round={round} />
      <Board clues={clues} />
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
      <p>{playerInControl}, you're in control</p>
    </>
  );
};

export default Display;
