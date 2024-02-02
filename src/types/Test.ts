import { Question } from "./Question";

export interface TestBasicInfo {
  id: string;
  title: string;
  description: string;
  total: number;
  topic: string;
}

export interface Test {
  _id: string;
  title: string;
  description: string;
  questions: Array<Question>;
  createdAt: string;
  topic: string;
}

export interface TestUnpopulated {
  _id: string;
  title: string;
  description: string;
  questions: Array<string>;
  createdAt: string;
  topic: string;
}
