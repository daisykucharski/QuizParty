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
