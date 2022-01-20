import {
  Player,
  Clues,
  DailyDouble,
  ViewData,
  ChooseClueData,
  Clue,
  JeopardyCategory,
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
  // Represents the current clue in play
  currentClue: {
    clue: Clue;
    categoryId: number;
    questionId: number;
    // represents whether or not the question has been answered
    answered: boolean;
  } | null;

  constructor() {
    this.clues = [];
    this.dailyDoubles = [];
    this.players = [];
    this.playerInControl = { name: "", earnings: 0 };
    this.round = 0;
    this.currentClue = null;
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
   * Determines whether all of the questions on the board have been answered
   * @returns whether the round is over
   */
  isRoundOver = () => {
    const board = this.clues as JeopardyCategory[];
    const categoryDone = (category: JeopardyCategory) =>
      category.questions.every((question) => question === null);
    return board.every((category) => categoryDone(category));
  };

  /**
   * Used when a player chooses a clue to answer in the game. Sets the current clue
   * to the question chosen and marks it as unanswered
   * @param categoryId the id of the category of the clue
   * @param questionId the id of the clue itself
   */
  chooseClue(categoryId: number, questionId: number): void {
    this.currentClue = {
      clue: this.getClue(categoryId, questionId),
      categoryId,
      questionId,
      answered: false,
    };
  }

  /**
   *Sets the current clue on the board to null to indicate that it has been answered
   * @throws an error if the clue doesn't exist on the board
   */
  markAsAnswered() {
    if (!this.currentClue) {
      return;
    }
    this.currentClue.answered = true;
    const { categoryId, questionId } = this.currentClue;
    const board = this.clues as JeopardyCategory[];

    const categoryIndex = board.findIndex(
      (category) => category.id === categoryId
    );
    if (categoryIndex === -1) {
      throw new Error("Category id does not exist");
    }

    var category = board[categoryIndex];

    const newQuestions = category.questions.map((clue) =>
      clue && clue.id === questionId ? null : clue
    );

    category.questions = newQuestions;
    board[categoryIndex] = category;
    this.clues = board;
  }

  /**
   * Gets the clue that is currently in play.
   * @returns the current clue in play
   * @throws an error if there is no clue in play currently
   */
  getCurrentClue(): Clue {
    if (!this.currentClue) {
      throw new Error("No clue in play");
    }
    return this.currentClue.clue;
  }

  /**
   * Determines whether the clue currently in play has been answered already
   * @returns whether the clue has been answered
   */
  clueAnswered(): boolean {
    if (!this.currentClue) {
      return false;
    }
    return this.currentClue.answered;
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
   * Gets the clue on the board associated with the given category id and question id.
   * @param categoryId the id of the category of the clue
   * @param questionId the id of the question of the clue
   * @throws an error if the clue doesn't exist on the board
   */
  getClue(categoryId: number, questionId: number): Clue {
    const board = this.clues as JeopardyCategory[];

    const chosenCategory = board.find((category) => category.id === categoryId);

    if (!chosenCategory) {
      throw new Error("Category id does not exist");
    }

    const clue = chosenCategory.questions.find(
      (clue) => clue && clue.id === questionId
    );

    if (!clue) {
      throw new Error("Question id does not exist");
    }

    return clue;
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
