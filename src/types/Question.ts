import { Option } from "./Option";

export interface Question {
  _id: string;
  description: string;
  options: Array<Option>;
  createdAt: Date;
  explanation?: string;
  timeLimit?: number;
  points?: number;
  difficulty?: "easy" | "medium" | "hard";
  shuffleOptions?: boolean;
}
