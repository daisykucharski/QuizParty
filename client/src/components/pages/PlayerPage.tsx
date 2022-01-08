import React, { Component } from "react";
import socketIOClient from "socket.io-client";
import qs from "qs";
import { Socket } from "socket.io-client";
import {
  ChooseClueData,
  JeopardyCategory,
  Player,
  ViewData,
} from "../../types";
import { Error } from "../functional/Error";

const ENDPOINT = "http://192.168.56.1:5000";

type PlayerState = {
  socket: Socket | null;
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
      socket: null,
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
    this.handleStartRound = this.handleStartRound.bind(this);
    this.handleChooseClue = this.handleChooseClue.bind(this);
  }

  componentDidMount() {
    const socket = socketIOClient(ENDPOINT);
    const { room, name } = qs.parse(window.location.search, {
      ignoreQueryPrefix: true,
    });
    this.setState({ socket, room: room as string, name: name as string });
    socket.on("gameError", () => this.setState({ error: true }));
    socket.on("startRound", this.handleStartRound);
    socket.on("chooseClue", (data: ChooseClueData) =>
      this.handleChooseClue(data)
    );
    socket.on("kick", this.handleKick);

    socket.emit("newPlayerJoin", { room, name });
  }

  componentWillUnmount() {
    this.state.socket?.disconnect();
  }

  handleKick = ({ player }: { room: string; player: Player }) => {
    console.log(`Kicking ${player.name}`);

    const { name } = this.state;
    if (player.name === name) {
      this.setState({ error: true });
    }
  };

  handleStartRound = (data: ViewData) => {
    const { name } = this.state;
    const { players } = data;

    const updatedPlayer = players.find((player) => player.name === name);

    if (!updatedPlayer) {
      return;
    }

    this.setState({ earnings: updatedPlayer.earnings });
  };

  handleChooseClue = ({ playerInControl, clues }: ChooseClueData) => {
    const { name } = this.state;
    console.log(name);

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
    const { waiting, name, waitingMessage, isChoosing, clues, error } =
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
      console.log(clues);
      return <p>Choosing clue</p>;
    }
    return <div></div>;
  }
}

// const PlayerPage = () => {
//   const [socket, setSocket] = useState<Socket | null>(null);
//   const [room, setRoom] = useState("");
//   const [name, setName] = useState("");
//   const [player, setPlayer] = useState<Player>({ name: "", earnings: 0 });

//   const [waiting, setWaiting] = useState(true);
//   const [waitingMessage, setWaitingMessage] = useState(
//     "Waiting for game to start"
//   );
//   const [isChoosing, setIsChoosing] = useState(false);
//   const [clues, setClues] = useState<JeopardyCategory[]>([]);

//   const navigate = useNavigate();

//   // Set the socket state and add all the necessary event listeners
//   // Determine the room id from the URL and notify the server that the display has joined
//   useEffect(() => {
//     const { room, name } = qs.parse(window.location.search, {
//       ignoreQueryPrefix: true,
//     });

//     setRoom(room as string);
//     setName(name as string);

//     const socket = socketIOClient(ENDPOINT);
//     setSocket(socket);

//     socket.on("gameError", () => navigate("/"));
//     socket.on("startRound", handleStartRound);
//     socket.on("chooseClue", (data: ChooseClueData) => handleChooseClue(data));
//     socket.on("kick", handleKick);

//     socket.emit("newPlayerJoin", { room, name });

//     return () => {
//       socket.disconnect();
//     };
//   }, []);

//   const handleKick = ({ player }: { room: string; player: Player }) => {
//     if (player.name === name) {
//       navigate("/");
//     }
//   };

//   const handleStartRound = (data: ViewData) => {
//     const { players } = data;

//     const updatedPlayer = players.find((player) => player.name === name);

//     if (!updatedPlayer) {
//       return;
//     }

//     setPlayer(updatedPlayer);
//   };

//   const handleChooseClue = ({ playerInControl, clues }: ChooseClueData) => {
//     console.log(player);

//     if (playerInControl !== player) {
//       setWaiting(true);
//       setWaitingMessage(`Waiting for ${playerInControl.name} to choose a clue`);
//     } else {
//       setWaiting(false);
//       setIsChoosing(true);
//       setClues(clues as JeopardyCategory[]);
//     }
//   };

//   if (waiting) {
//     return (
//       <div>
//         <h2>{name}</h2>
//         <p>{waitingMessage}</p>
//       </div>
//     );
//   }

//   if (isChoosing) {
//     console.log(clues);

//     return <p>Choosing clue</p>;
//   }

//   return <div></div>;
// };

export default PlayerPage;
