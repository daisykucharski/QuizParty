import React, { Component } from "react";
import { Socket } from "socket.io-client";
import socketIOClient from "socket.io-client";
import qs from "qs";
import { ViewData, Clues, Player, JeopardyCategory } from "../../types";

import Board from "../functional/Board";
import Header from "../functional/Header";
import Waiting from "../functional/Waiting";
import { Error } from "../functional/Error";

const ENDPOINT = "http://192.168.56.1:5000";

type DisplayState = {
  socket: Socket | null;
  room: string;
  waiting: boolean;
  clues: Clues;
  players: Player[];
  playerInControl: Player;
  round: number;
  error: boolean;
};

/**
 * This component represents the display page of the application. This is
 * the page that shows the Jeopardy clues
 */
class DisplayPage extends Component<{}, DisplayState> {
  constructor(props: {}) {
    super(props);
    this.state = {
      socket: null,
      room: "",
      waiting: true,
      clues: [],
      players: [],
      playerInControl: { name: "", earnings: 0 },
      round: 0,
      error: false,
    };

    this.handleStartRound = this.handleStartRound.bind(this);
  }

  componentDidMount() {
    const socket = socketIOClient(ENDPOINT);
    const { room } = qs.parse(window.location.search, {
      ignoreQueryPrefix: true,
    });
    this.setState({ socket, room: room as string });

    socket.on("startRound", this.handleStartRound);
    socket.on("gameError", () => this.setState({ error: true }));
    socket.on("newPlayers", ({ players }: { players: Player[] }) =>
      this.setState({ players: players })
    );

    socket.emit("newDisplayJoin", { room });
  }

  componentWillUnmount() {
    this.state.socket?.disconnect();
  }

  /**
   * Updates the state to reflect the new data for the start of the next round
   * Sets waiting to false because a round has started
   * @param data the data for the start of the round
   */
  handleStartRound = ({ clues, players, playerInControl, round }: ViewData) => {
    console.log("Handling start round");

    this.setState({ clues, players, playerInControl, round, waiting: false });
  };

  render() {
    const {
      error,
      waiting,
      room,
      players,
      socket,
      round,
      clues,
      playerInControl,
    } = this.state;
    if (error) {
      return <Error />;
    }

    if (waiting) {
      return (
        <Waiting
          room={room}
          players={players}
          handleStart={() => socket?.emit("start", { room })}
          kick={(player: Player) => socket?.emit("kick", { room, player })}
        />
      );
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

// /**
//  * This component represents the display page of the application. This is
//  * the page that shows the Jeopardy clues
//  * @returns the component for the display page
//  */
// const DisplayPage = () => {
//   // state for running the game
//   const [socket, setSocket] = useState<Socket | null>(null);
//   const [room, setRoom] = useState("");
//   const [waiting, setWaiting] = useState(true);

//   // State regarding the gameplay
//   const [clues, setClues] = useState<Clues>([]);
//   const [players, setPlayers] = useState<Player[]>([]);
//   const [playerInControl, setPlayerInControl] = useState<Player>({
//     name: "",
//     earnings: 0,
//   });
//   const [round, setRound] = useState(0);

//   const navigate = useNavigate();

//   // Set the socket state and add all the necessary event listeners
//   // Determine the room id from the URL and notify the server that the display has joined
//   useEffect(() => {
//     const { room } = qs.parse(window.location.search, {
//       ignoreQueryPrefix: true,
//     });
//     setRoom(room as string);

//     const socket = socketIOClient(ENDPOINT);
//     setSocket(socket);
//     socket.on("startRound", handleStartRound);
//     socket.on("gameError", () => {
//       console.log("Game error, returning to home page");
//       navigate("/");
//     });
//     socket.on("newPlayers", ({ players }: { players: Player[] }) => {
//       setPlayers(players);
//     });

//     socket.emit("newDisplayJoin", { room });

//     return () => {
//       socket.disconnect();
//     };
//   }, [navigate]);

//   /**
//    * Updates the state to reflect the new data for the start of the next round
//    * Sets waiting to false because a round has started
//    * @param data the data for the start of the round
//    */
//   const handleStartRound = ({
//     clues,
//     players,
//     playerInControl,
//     round,
//   }: ViewData) => {
//     setClues(clues);
//     setPlayers(players);
//     setPlayerInControl(playerInControl);
//     setRound(round);
//     setWaiting(false);
//   };

//   if (waiting) {
//     return (
//       <Waiting
//         room={room}
//         players={players}
//         handleStart={() => socket?.emit("start", { room })}
//         kick={(player: Player) => socket?.emit("kick", { room, player })}
//       />
//     );
//   }

//   return (
//     <>
//       <Header round={round} />
//       {round > 0 ? (
//         round < 3 ? (
//           <Board clues={clues as JeopardyCategory[]} />
//         ) : (
//           "Display Final Jeopardy! clue"
//         )
//       ) : (
//         ""
//       )}

//       <div className="leaderboard">
//         <p>Leaderboard:</p>
//         {players.map((player, index) => {
//           return (
//             <div className="player-score" key={index}>
//               <p>
//                 {player.name} | ${player.earnings}
//               </p>
//             </div>
//           );
//         })}
//       </div>
//       <p>{playerInControl && playerInControl.name}, you're in control</p>
//     </>
//   );
// };

export default DisplayPage;
