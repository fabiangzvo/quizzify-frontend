import { Test } from "./Test";

export interface Answer {
  questionId: string;
  optionId: string;
  isCorrect: boolean;
  _id?: string;
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
  _id?: string;
  time: number;
  correctAnswers: number;
  rating: number;
  test: string | Test;
  presentedAt: string;
  answers: Array<Answer>;
  user: string;
  createdAt?: string;
  updatedAt?: string;
}
