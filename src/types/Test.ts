import { Question } from "./Question";

export type TopicItem =
  | string
  | {
      _id?: string;
      name?: string;
      title?: string;
      description?: string;
      label?: string;
    };

export interface TestBasicInfo {
  id: string;
  title: string;
  description: string;
  total: number;
  topic?: string;
  topics?: Array<TopicItem>;
}

export interface Test {
  _id: string;
  title: string;
  description: string;
  questions: Array<Question>;
  createdAt: string;
  topic?: string;
  topics?: Array<TopicItem>;
}

export interface TestUnpopulated {
  _id: string;
  title: string;
  description: string;
  questions: Array<string>;
  createdAt: string;
  topic?: string;
  topics?: Array<TopicItem>;
}

export interface CreateTestOptionPayload {
  description: string;
  isCorrect: boolean;
}

export interface CreateTestQuestionPayload {
  description: string;
  explanation: string;
  timeLimit: number;
  points: number;
  difficulty: "easy" | "medium" | "hard";
  shuffleOptions: boolean;
  options: Array<CreateTestOptionPayload>;
}

export interface CreateTestPayload {
  title: string;
  topics: Array<string>;
  description: string;
  questions: Array<CreateTestQuestionPayload>;
}

export type UpdateTestOptionPayload = Partial<CreateTestOptionPayload> & {
  _id?: string;
};

export type UpdateTestQuestionPayload = Partial<
  Omit<CreateTestQuestionPayload, "options">
> & {
  _id?: string;
  options?: Array<UpdateTestOptionPayload>;
};

export interface UpdateTestPayload {
  title?: string;
  topics?: Array<string>;
  description?: string;
  questions?: Array<UpdateTestQuestionPayload>;
}
