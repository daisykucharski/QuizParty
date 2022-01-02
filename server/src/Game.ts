import { Player, Clues, DailyDouble, ViewData } from "./types";
import { getClues } from "./fetch-questions";

/**
 * Represents one game of Jeopardy!.
 */
class Game {
  clues: Clues;
  dailyDoubles: DailyDouble[];
  players: Player[];
  playerInControl: Player;
  round: 0;

  constructor() {
    this.clues = [];
    this.dailyDoubles = [];
    this.players = [];
    // [
    //   { name: "1", earnings: 100 },
    //   { name: "2", earnings: 0 },
    //   { name: "3", earnings: 200 },
    // ];
    this.playerInControl = { name: "", earnings: 0 };
    // { name: "1", earnings: 100 };
    this.round = 0;
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
   * Determines how many players are in this game
   * @returns the number of players in this game
   */
  getNumPlayers(): number {
    return this.players.length;
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
