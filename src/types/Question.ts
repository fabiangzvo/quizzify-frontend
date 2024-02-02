import { Option } from "./Option";

export interface Question {
  _id: string;
  description: string;
  options: Array<Option>;
  createdAt: Date;
}
