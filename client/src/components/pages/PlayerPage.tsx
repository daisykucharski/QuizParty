import React, { Component } from "react";
import socketIOClient from "socket.io-client";
import qs from "qs";
import { Socket } from "socket.io-client";
import { ChooseClueData, JeopardyCategory, Player } from "../../types";
import Error from "../functional/Error";
import ChooseClue from "../functional/ChooseClue";

const ENDPOINT = "http://192.168.56.1:5000";
const socket = socketIOClient(ENDPOINT);

type PlayerState = {
  room: string;
  name: string;
  earnings: number;
  waiting: boolean;
  waitingMessage: string;
  isChoosing: boolean;
  clues: JeopardyCategory[];
  error: boolean;
};

class PlayerPage extends Component<{}, PlayerState> {
  constructor(props: {}) {
    super(props);
    this.state = {
      room: "",
      name: "",
      earnings: 0,
      waiting: true,
      waitingMessage: "Waiting for game to start",
      isChoosing: false,
      clues: [],
      error: false,
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
    socket.on("gameError", () => this.setState({ error: true }));
    //socket.on("startRound", this.handleStartRound);
    socket.on("chooseClue", (data: ChooseClueData) =>
      this.handleChooseClue(data)
    );
    socket.on("kick", this.handleKick);
    socket.on("regularQuestion", () =>
      this.setState({ waiting: true, waitingMessage: "Read the clue" })
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
      this.setState({ error: true });
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
        waiting: true,
        waitingMessage: `Waiting for ${playerInControl.name} to choose a clue`,
      });
    } else {
      this.setState({
        waiting: false,
        isChoosing: true,
        clues: clues as JeopardyCategory[],
      });
    }
  };

  render() {
    const { waiting, room, name, waitingMessage, isChoosing, clues, error } =
      this.state;

    if (error) {
      return <Error />;
    }

    if (waiting) {
      return (
        <div>
          <h2>{name}</h2>
          <p>{waitingMessage}</p>
        </div>
      );
    }
    if (isChoosing) {
      return (
        <ChooseClue
          clues={clues as JeopardyCategory[]}
          socket={socket}
          room={room}
        />
      );
    }
    return <div></div>;
  }
}

export default PlayerPage;
