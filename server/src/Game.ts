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
  round: number;

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
