import React, { useEffect, useState } from "react";
import socketIOClient, { Socket } from "socket.io-client";
import { useNavigate } from "react-router-dom";

import NavButton from "../functional/NavButton";
import InputForm from "../functional/InputForm";

const ENDPOINT = "http://192.168.56.1:5000";

const StartPage = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [inMenu, setInMenu] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [room, setRoom] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [choice, setChoice] = useState<"display" | "player" | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    const socket = socketIOClient(ENDPOINT);
    setSocket(socket);
    socket.on("newGameCreated", (room) => {
      setRoom(room);
      setConfirmed(true);
    });
    socket.on("joinConfirmed", () => setConfirmed(true));
    socket.on("errorMessage", (msg) => {
      displayError(msg);
    });
  }, []);

  /**
   * Ensures that the data is valid to start or join a game. If the choice was to be a display client,
   * then no room or name data needs to be entered. If the choice was to be a player client, then the
   * client must choose a room and name
   * @returns whether the data is valid for the given choice
   */
  const ensureValidData = (): boolean => {
    return (
      choice === "display" ||
      (choice === "player" && !(room === "") && !(name === ""))
    );
  };

  /**
   * Handles setting the choice of the user to display or player
   * @param choice the choice that the client made
   */
  const handleChoice = (choice: string) => {
    if (choice === "display") {
      setChoice(choice);
      socket?.emit("newGame");
    }

    if (choice === "player") {
      setChoice(choice);
      setInMenu(true);
    }
  };

  /**
   * Submits the input form for creating or joining a game
   */
  const handleSubmit = () => {
    if (ensureValidData()) {
      if (choice === "player") {
        socket?.emit("joining", { room: room, name: name });
      }
    } else {
      displayError("Please fill out name and room id");
    }
  };

  /**
   * Updates the name or room state values when the user types in the form
   * @param e the change event
   */
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target) {
      const { name, value } = event.target as HTMLButtonElement;
      if (name === "name") {
        setName(value);
      }
      if (name === "room") {
        setRoom(value);
      }
    }
  };

  /**
   * Function that returns the user back to the original starting page
   */
  const returnToStart = () => {
    setInMenu(false);
  };

  /**
   * Displays the given error message for 3 seconds
   * @param message the error message to display
   */
  const displayError = (message: string) => {
    setError(true);
    setErrorMessage(message);
    setTimeout(() => {
      setError(false);
    }, 3000);
  };

  // if the game has been confirmed, redirect the client to the room they chose
  if (confirmed) {
    const link =
      `/${choice}?room=${room}` + (choice === "player" ? `&name=${name}` : "");
    navigate(link);
    return <div>Navigating to game</div>;
  }

  if (!inMenu) {
    return (
      <>
        <NavButton
          label="Create New Game"
          onSubmit={() => handleChoice("display")}
        />
        <NavButton
          label="Join Existing Game"
          onSubmit={() => handleChoice("player")}
        />
      </>
    );
  }

  return (
    <>
      {error && <h1 className="error-msg">{errorMessage}</h1>}
      {choice === "player" && (
        <InputForm
          playerName={name}
          room={room}
          onSubmit={handleSubmit}
          onTyping={handleChange}
          goBack={returnToStart}
        />
      )}
    </>
  );
};

export default StartPage;
