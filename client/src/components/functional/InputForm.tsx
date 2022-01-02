import React from "react";
import NavButton from "./NavButton";

const InputForm = ({
  playerName,
  room,
  onSubmit,
  onTyping,
  goBack,
}: {
  playerName: string;
  room: string;
  onSubmit: () => void;
  onTyping: (event: React.ChangeEvent<HTMLInputElement>) => void;
  goBack: () => void;
}) => {
  return (
    <div>
      <input
        type="text"
        autoComplete="off"
        name="name"
        id="name"
        placeholder="Your name"
        value={playerName}
        onChange={onTyping}
      />
      <input
        type="text"
        autoComplete="off"
        name="room"
        id="room"
        placeholder="Room id"
        value={room}
        onChange={onTyping}
      />
      <div>
        <NavButton label="Return to home page" onSubmit={goBack} />
        <NavButton label="Join game" onSubmit={onSubmit} />
      </div>
    </div>
  );
};

export default InputForm;
