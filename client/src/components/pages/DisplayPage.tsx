import React, { Component } from "react";
import { Socket } from "socket.io-client";
import socketIOClient from "socket.io-client";
import qs from "qs";
import { ViewData, Clues, Player, JeopardyCategory } from "../../types";

import Board from "../functional/Board";
import Header from "../functional/Header";
import Waiting from "../functional/Waiting";
import Error from "../functional/Error";
import DisplayClue from "../functional/DisplayClue";

const ENDPOINT = "http://192.168.56.1:5000";
const socket = socketIOClient(ENDPOINT);

type DisplayState = {
  room: string;
  waiting: boolean;
  clues: Clues;
  players: Player[];
  playerInControl: Player;
  round: number;
  error: boolean;
  displayClue: boolean;
  currentClue: string;
};

/**
 * This component represents the display page of the application. This is
 * the page that shows the Jeopardy clues
 */
class DisplayPage extends Component<{}, DisplayState> {
  constructor(props: {}) {
    super(props);
    this.state = {
      room: "",
      waiting: true,
      clues: [],
      players: [],
      playerInControl: { name: "", earnings: 0 },
      round: 0,
      error: false,
      displayClue: false,
      currentClue: "",
    };

    this.handleStartRound = this.handleStartRound.bind(this);
    this.handleRegularQuesiton = this.handleRegularQuesiton.bind(this);
  }

  componentDidMount() {
    const { room } = qs.parse(window.location.search, {
      ignoreQueryPrefix: true,
    });
    this.setState({ room: room as string });

    socket.on("startRound", this.handleStartRound);
    socket.on("gameError", () => this.setState({ error: true }));
    socket.on("newPlayers", ({ players }: { players: Player[] }) =>
      this.setState({ players: players })
    );
    socket.on("regularQuestion", (data) => this.handleRegularQuesiton(data));

    socket.emit("newDisplayJoin", { room });
  }

  componentWillUnmount() {
    socket.disconnect();
  }

  /**
   * Updates the state to reflect the new data for the start of the next round
   * Sets waiting to false because a round has started
   * @param data the data for the start of the round
   */
  handleStartRound = ({ clues, players, playerInControl, round }: ViewData) => {
    this.setState({ clues, players, playerInControl, round, waiting: false });
  };

  /**
   * Updates the state in order to display the given question. After 2 seconds, notify
   * the other clients that answers can be allowed. This is important to give players the chance
   * to read the question before buzzing.
   * @param data the clue to display
   */
  handleRegularQuesiton = ({ clue }: { clue: string }) => {
    console.log(clue);

    this.setState({ currentClue: clue, displayClue: true });
    setTimeout(() => socket.emit("allowAnswers"), 2000);
  };

  render() {
    const {
      displayClue,
      error,
      waiting,
      room,
      players,
      round,
      clues,
      playerInControl,
      currentClue,
    } = this.state;

    if (error) {
      return <Error />;
    }

    if (waiting) {
      return (
        <Waiting
          room={room}
          players={players}
          handleStart={() => socket.emit("start", { room })}
          kick={(player: Player) => socket?.emit("kick", { room, player })}
        />
      );
    }

    if (displayClue) {
      return <DisplayClue clue={currentClue} />;
    }

    return (
      <>
        <Header round={round} />
        {round < 3 ? (
          <Board clues={clues as JeopardyCategory[]} />
        ) : (
          "Display Final Jeopardy! clue"
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
  }
}

export default DisplayPage;
