import React, { Component } from "react";
import socketIOClient from "socket.io-client";
import qs from "qs";
import { ChooseClueData, JeopardyCategory, Player } from "../../types";
import Error from "../functional/Error";
import ChooseClue from "../functional/ChooseClue";

const ENDPOINT = "http://192.168.56.1:5000";
const socket = socketIOClient(ENDPOINT);

enum PlayerStatus {
  Waiting,
  IsChoosing,
  Error,
  CanAnswer,
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
    //this.handleStartRound = this.handleStartRound.bind(this);
    this.handleChooseClue = this.handleChooseClue.bind(this);
  }

  componentDidMount() {
    const { room, name } = qs.parse(window.location.search, {
      ignoreQueryPrefix: true,
    });
    this.setState({ room: room as string, name: name as string });
    socket.on("gameError", () => this.setState({ status: PlayerStatus.Error }));
    //socket.on("startRound", this.handleStartRound);
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
      this.setState({ status: PlayerStatus.CanAnswer })
    );
    socket.on("noAnswer", () =>
      this.setState({
        status: PlayerStatus.Waiting,
        waitingMessage: "No one answered correctly",
      })
    );

    socket.emit("newPlayerJoin", { room, name });
  }

  componentWillUnmount() {
    socket.disconnect();
  }

  handleKick = ({ player }: { room: string; player: Player }) => {
    console.log(`Kicking ${player.name}`);

    const { name } = this.state;
    if (player.name === name) {
      this.setState({ status: PlayerStatus.Error });
    }
  };

  // Probably not necessary
  // handleStartRound = (data: ViewData) => {
  //   const { name } = this.state;
  //   const { players } = data;

  //   // Determine whether this player has been updated
  //   const updatedPlayer = players.find((player) => player.name === name);

  //   if (!updatedPlayer) {
  //     return;
  //   }

  //   this.setState({ earnings: updatedPlayer.earnings });
  // };

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

      case PlayerStatus.CanAnswer:
        return (
          <button onClick={() => socket.emit("buzz", { room, name })}>
            Buzz
          </button>
        );

      default:
        return <div></div>;
    }
  }
}

export default PlayerPage;
