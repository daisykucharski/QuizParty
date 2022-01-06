export interface Clue {
  id: number;
  question: string;
  answer: string;
  value: number;
}

export interface JeopardyCategory {
  id: number;
  category: string;
  // if a question has been answered, it is replaced with null
  questions: Array<Clue | null>;
}

export interface FinalJeopardyClue {
  id: number;
  category: string;
  question: string;
  answer: string;
}

export type Clues = JeopardyCategory[] | FinalJeopardyClue;

export interface Player {
  name: string;
  earnings: number;
  socketid?: string;
}

// Data that the server sends to the client
export interface ViewData {
  clues: Clues;
  players: Player[];
  playerInControl: Player;
  round: number;
}

export interface ChooseClueData {
  playerInControl: Player;
  clues: Clues;
}
