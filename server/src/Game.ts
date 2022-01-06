import {
  Player,
  Clues,
  DailyDouble,
  ViewData,
  JeopardyCategory,
  ChooseClueData,
} from "./types";
import { getClues } from "./fetch-questions";

/**
 * Represents one game of Jeopardy!.
 */
class Game {
  displaySocketId = "";
  clues: Clues;
  dailyDoubles: DailyDouble[];
  players: Player[];
  playerInControl: Player;
  round: number;

  constructor() {
    this.clues = [];
    this.dailyDoubles = [];
    this.players = [];
    this.playerInControl = { name: "", earnings: 0 };
    this.round = 0;
  }

  /**
   * Stores the id of the socket for the display client of this game
   * @param displaySocketId the new displaySocketId
   */
  setDisplaySocketId(displaySocketId: string) {
    this.displaySocketId = displaySocketId;
  }

  /**
   * Gets the id of the socket for the display cilent of this game
   * @returns the id of the display socket
   */
  getDisplaySocketId(): string {
    return this.displaySocketId;
  }

  /**
   * Gets the data from this game that the front end needs to render the game
   * @returns data for the front end
   */
  getData(): ViewData {
    return {
      clues: this.clues,
      players: this.players,
      playerInControl: this.playerInControl,
      round: this.round,
    };
  }

  /**
   * Gets the data from this name necessary for a player to choose a clue to answer
   * @returns data for the front end
   */
  getChooseClueData(): ChooseClueData {
    return {
      playerInControl: this.playerInControl,
      clues: this.clues,
    };
  }

  /**
   * Determines whether the player with the given name is in this game
   * @param name the name of the player
   */
  playerInGame(name: string) {
    return this.players.some((player) => player.name === name);
  }

  /**
   * Adds the given player to this game. If there is no player in control yet,
   * then set this player as the player in control
   * @param newPlayer
   */
  addPlayer(newPlayer: Player) {
    this.players.push(newPlayer);
    if (this.playerInControl.name === "") {
      this.playerInControl = newPlayer;
    }
  }

  /**
   * Kicks the given player from the game
   * @param playerToRemove the player to remove
   */
  removePlayer(playerToRemove: Player) {
    const newPlayers = this.players.filter(
      (player) => player.name !== playerToRemove.name
    );
    this.players = newPlayers;

    // If the player being is kicked is the player in control, reset the player in control
    if (playerToRemove.name == this.playerInControl.name) {
      // if there are players left in the game, choose the next person to have joined
      // otherwise set the player in control back to nobody
      if (this.players.length > 0) {
        this.playerInControl = this.players[0];
      } else {
        this.playerInControl = { name: "", earnings: 0 };
      }
    }
  }

  /**
   * Returns a list of players in this game
   * @returns the players in this game
   */
  getPlayers(): Player[] {
    return this.players;
  }

  /**
   * Starts the next round of this game. Increases the round number,
   *  gets the clues and updates the player in control as necessary
   */
  async startNextRound() {
    this.round += 1;
    this.clues = await getClues(this.round, 0);

    // After the first round, the initial player in control of the round is the player who has earned the least
    if (this.round > 1) {
      const lowestEarner = this.players.reduce((prevLowest, newPlayer) =>
        newPlayer.earnings < prevLowest.earnings ? newPlayer : prevLowest
      );
      this.playerInControl = lowestEarner;
    }
  }
}

export default Game;
