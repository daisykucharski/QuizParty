import React from "react";
import { Player } from "../../types";
import { v4 as uuidv4 } from "uuid";

const Waiting = ({
  room,
  players,
  handleStart,
  kick,
}: {
  room: string;
  players: Player[];
  handleStart: () => void;
  kick: (player: Player) => void;
}) => {
  return (
    <>
      <h1>Join the game on another device using code {room}</h1>
      {players.map((player) => (
        <div className="player" key={uuidv4()}>
          <h3>{player.name}</h3>
          <button onClick={() => kick(player)}>Kick</button>
        </div>
      ))}
      <button onClick={handleStart}>Start game</button>
    </>
  );
};

export default Waiting;
