import React, { useEffect, useState } from "react";
import socketIOClient from "socket.io-client";
import { ViewData, Clues, Player, JeopardyCategory } from "../../types";

import Board from "../functional/Board";
import Header from "../functional/Header";

const ENDPOINT = "http://192.168.56.1:5000";

/**
 * This component represents the display page of the application. This is
 * the page that shows the Jeopardy clues
 * @returns the component for the display page
 */
const Display = () => {
  useEffect(() => {
    const socket = socketIOClient(ENDPOINT);
    socket.emit("start");
    socket.on("startRound", handleStartRound);

    return () => {
      socket.disconnect();
    };
  }, []);

  const [clues, setClues] = useState<Clues>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [playerInControl, setPlayerInControl] = useState<Player>({
    name: "",
    earnings: 0,
  });
  const [round, setRound] = useState(0);

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
  };

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

export default Display;
