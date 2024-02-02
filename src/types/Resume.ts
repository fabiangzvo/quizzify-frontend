import { Test } from "./Test";

export interface Answer {
  questionId: string;
  optionId: string;
  isCorrect: boolean;
}

export interface CompleteResume {
  time: number;
  correctAnswers: number;
  rating: number;
  test: Test;
  presentedAt: string;
  answers: Array<Answer>;
}

export interface Resume {
  time: number;
  correctAnswers: number;
  rating: number;
  test: string;
  presentedAt: string;
  answers: Array<Answer>;
}
