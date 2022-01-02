export interface Clue {
  question: string;
  answer: string;
  value: number;
}

export interface JeopardyCategory {
  category: string;
  questions: Clue[];
}

export interface FinalJeopardyClue {
  category: string;
  question: string;
  answer: string;
}

export interface DailyDouble {
  category: number;
  question: number;
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
