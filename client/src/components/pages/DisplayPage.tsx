import React, { Component } from "react";
import socketIOClient from "socket.io-client";
import qs from "qs";
import { ViewData, Clues, Player, JeopardyCategory } from "../../types";

import Board from "../functional/Board";
import Header from "../functional/Header";
import Waiting from "../functional/Waiting";
import Error from "../functional/Error";
import DisplayClue from "../functional/DisplayClue";
import DisplayAnswer from "../functional/DisplayAnswer";

const ENDPOINT = "http://192.168.56.1:5000";
const socket = socketIOClient(ENDPOINT);

enum DisplayStatus {
  Waiting,
  Error,
  DisplayBoard,
  DisplayClue,
  DisplayAnswer,
}

type DisplayState = {
  room: string;
  status: DisplayStatus;
  clues: Clues;
  players: Player[];
  playerInControl: Player;
  round: number;
  currentClue: string;
  answer: string;
  answerer: Player;
  playerAnswer: string;
  answerStatus: "noAnswer" | "correct" | "confirmAnswer";
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
      status: DisplayStatus.Waiting,
      clues: [],
      players: [],
      playerInControl: { name: "", earnings: 0 },
      round: 0,
      currentClue: "",
      answer: "",
      answerer: { name: "", earnings: 0 },
      playerAnswer: "",
      answerStatus: "noAnswer",
    };

    this.handleUpdateGame = this.handleUpdateGame.bind(this);
    this.handleRegularQuesiton = this.handleRegularQuesiton.bind(this);
  }

  componentDidMount() {
    const { room } = qs.parse(window.location.search, {
      ignoreQueryPrefix: true,
    });
    this.setState({ room: room as string });

    socket.on("updateGame", this.handleUpdateGame);
    socket.on("gameError", () =>
      this.setState({ status: DisplayStatus.Error })
    );
    socket.on("newPlayers", ({ players }: { players: Player[] }) =>
      this.setState({ players: players })
    );
    socket.on("regularQuestion", (data) => this.handleRegularQuesiton(data));
    socket.on("noAnswer", (answer: string) =>
      this.setState({
        status: DisplayStatus.DisplayAnswer,
        answer: answer,
        answerStatus: "noAnswer",
      })
    );
    socket.on(
      "correctAnswer",
      ({ answer, answerer }: { answer: string; answerer: Player }) =>
        this.setState({
          status: DisplayStatus.DisplayAnswer,
          answer: answer,
          answerStatus: "correct",
          answerer: answerer,
        })
    );

    socket.on(
      "confirmAnswer",
      ({
        correctAnswer,
        playerAnswer,
        answerer,
      }: {
        correctAnswer: string;
        playerAnswer: string;
        answerer: Player;
      }) => {
        this.setState({
          status: DisplayStatus.DisplayAnswer,
          answer: correctAnswer,
          playerAnswer,
          answerStatus: "confirmAnswer",
          answerer: answerer,
        });
      }
    );

    socket.emit("newDisplayJoin", { room });
  }

  componentWillUnmount() {
    socket.disconnect();
  }

  /**
   * Updates the state to reflect the new data after events happen
   * Sets waiting to false because a game is happening
   * @param data the data for the start of the round
   */
  handleUpdateGame = ({ clues, players, playerInControl, round }: ViewData) => {
    this.setState({
      clues,
      players,
      playerInControl,
      round,
      status: DisplayStatus.DisplayBoard,
    });
  };

  /**
   * Updates the state in order to display the given question.
   * @param data the clue to display
   */
  handleRegularQuesiton = ({ clue }: { clue: string }) => {
    this.setState({ currentClue: clue, status: DisplayStatus.DisplayClue });
  };

  render() {
    const {
      status,
      room,
      players,
      round,
      clues,
      playerInControl,
      currentClue,
      answer,
      playerAnswer,
      answerStatus,
      answerer,
    } = this.state;

    switch (+status) {
      case DisplayStatus.Error:
        return <Error />;

      case DisplayStatus.Waiting:
        return (
          <Waiting
            room={room}
            players={players}
            handleStart={() => socket.emit("start", { room })}
            kick={(player: Player) => socket?.emit("kick", { room, player })}
          />
        );

      case DisplayStatus.DisplayClue:
        return <DisplayClue clue={currentClue} />;

      case DisplayStatus.DisplayAnswer:
        return (
          <DisplayAnswer
            answer={answer}
            answerer={answerer}
            answerStatus={answerStatus}
            playerAnswer={playerAnswer}
          />
        );

      case DisplayStatus.DisplayBoard:
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
      default:
        return <div></div>;
    }
  }
}

export default DisplayPage;
