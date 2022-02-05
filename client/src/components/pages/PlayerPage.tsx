import React, { Component } from "react";
import socketIOClient from "socket.io-client";
import qs from "qs";
import { ChooseClueData, JeopardyCategory, Player } from "../../types";
import Error from "../functional/Error";
import ChooseClue from "../functional/ChooseClue";
import AnswerQuestion from "../functional/AnswerQuestion";
import ConfirmAnswer from "../functional/ConfirmAnswer";

const ENDPOINT = "http://localhost:5000";
const socket = socketIOClient(ENDPOINT);

enum PlayerStatus {
  Waiting,
  IsChoosing,
  Error,
  Buzz,
  AnswerQuestion,
  ConfirmAnswer,
}

type PlayerState = {
  room: string;
  name: string;
  earnings: number;
  waitingMessage: string;
  clues: JeopardyCategory[];
  status: PlayerStatus;
};

class PlayerPage extends Component<{}, PlayerState> {
  constructor(props: {}) {
    super(props);
    this.state = {
      room: "",
      name: "",
      earnings: 0,
      status: PlayerStatus.Waiting,
      waitingMessage: "Waiting for game to start",
      clues: [],
    };

    this.handleKick = this.handleKick.bind(this);
    this.handleChooseClue = this.handleChooseClue.bind(this);
    this.handleAnswerQuestion = this.handleAnswerQuestion.bind(this);
    this.handleConfirmAnswer = this.handleConfirmAnswer.bind(this);
  }

  componentDidMount() {
    const { room, name } = qs.parse(window.location.search, {
      ignoreQueryPrefix: true,
    });
    this.setState({ room: room as string, name: name as string });
    socket.on("gameError", () => this.setState({ status: PlayerStatus.Error }));
    socket.on("chooseClue", (data: ChooseClueData) =>
      this.handleChooseClue(data)
    );
    socket.on("kick", this.handleKick);

    socket.on("regularQuestion", () =>
      this.setState({
        status: PlayerStatus.Waiting,
        waitingMessage: "Read the clue",
      })
    );
    socket.on("allowAnswers", () =>
      this.setState({ status: PlayerStatus.Buzz })
    );
    socket.on("noAnswer", () =>
      this.setState({
        status: PlayerStatus.Waiting,
        waitingMessage: "No one answered correctly",
      })
    );

    socket.on("correctAnswer", () =>
      this.setState({
        status: PlayerStatus.Waiting,
        waitingMessage: "Answer was correct",
      })
    );

    socket.on("answerQuestion", (data) => this.handleAnswerQuestion(data));

    socket.on("confirmAnswer", (data) => this.handleConfirmAnswer(data));

    socket.emit("newPlayerJoin", { room, name });
  }

  componentWillUnmount() {
    socket.disconnect();
  }

  /**
   * Kicks the player with the given name from the game. If the name of this player
   * is the player being kicked, throw an error
   * @param data The name of the player to kick
   */
  handleKick = ({ player }: { room: string; player: Player }) => {
    console.log(`Kicking ${player.name}`);

    const { name } = this.state;
    if (player.name === name) {
      this.setState({ status: PlayerStatus.Error });
    }
  };

  /**
   * If the player just answered the question, wait for other players
   * to confirm their answer. Otherwise, confirm the player's answer
   * @param player name of player in control
   */
  handleConfirmAnswer = ({
    answerer,
  }: {
    answerer: Player;
    correctAnswer: string;
    playerAnswer: string;
  }) => {
    console.log("Received confirm answer event");

    if (answerer.name === this.state.name) {
      this.setState({
        status: PlayerStatus.Waiting,
        waitingMessage: "Waiting for players to confirm answer",
      });
    } else {
      this.setState({ status: PlayerStatus.ConfirmAnswer });
    }
  };

  /**
   *  Handles choosing a clue. If this player is the player in control,
   *  choose a clue. Otherwise, wait for the player to choose a clue
   * @param data the playerInControl and the clues to choose from
   */
  handleChooseClue = ({ playerInControl, clues }: ChooseClueData) => {
    const { name } = this.state;

    if (playerInControl.name !== name) {
      this.setState({
        status: PlayerStatus.Waiting,
        waitingMessage: `Waiting for ${playerInControl.name} to choose a clue`,
      });
    } else {
      this.setState({
        status: PlayerStatus.IsChoosing,
        clues: clues as JeopardyCategory[],
      });
    }
  };

  /**
   * If this player is in the list of players to answer the question,
   * change status to AnswerQuestion. Otherwise, wait for players to
   * answer
   * @param names the names of the players to answer the question
   */
  handleAnswerQuestion = ({ names }: { names: string[] }) => {
    if (names.includes(this.state.name)) {
      this.setState({
        status: PlayerStatus.AnswerQuestion,
      });
    } else {
      this.setState({
        status: PlayerStatus.Waiting,
        waitingMessage: `Waiting for ${names.join(
          ", "
        )} to answer the question`,
      });
    }
  };

  render() {
    const { status, room, waitingMessage, clues, name } = this.state;

    switch (+status) {
      case PlayerStatus.Error:
        return <Error />;
      case PlayerStatus.Waiting:
        return (
          <div>
            <p>{waitingMessage}</p>
          </div>
        );
      case PlayerStatus.IsChoosing:
        return (
          <ChooseClue
            clues={clues as JeopardyCategory[]}
            socket={socket}
            room={room}
          />
        );

      case PlayerStatus.Buzz:
        return (
          <button onClick={() => socket.emit("buzz", { room, name })}>
            Buzz
          </button>
        );

      case PlayerStatus.AnswerQuestion:
        return (
          <AnswerQuestion
            onSubmit={(answer) => socket.emit("answer", { room, answer })}
          />
        );

      case PlayerStatus.ConfirmAnswer:
        return (
          <ConfirmAnswer
            handleCorrect={() => socket.emit("playerCorrect", room)}
            handleIncorrect={() => socket.emit("playerIncorrect", room)}
          />
        );

      default:
        return <div></div>;
    }
  }
}

export default PlayerPage;
