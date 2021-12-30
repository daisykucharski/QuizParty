export interface Question {
    question: string;
    answer: string;
    value: number;
}

export interface JeopardyCategory {
    category: string;
    questions: Question[];
}

export interface FinalJeopardyQuestion {
    category: string;
    question: string;
    answer: string;
}