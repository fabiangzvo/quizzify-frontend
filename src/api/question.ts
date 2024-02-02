import { Question } from "@/types/Question";

import api from "./quizzifyApi";

interface TestById {
  questionId: string;
}

export async function getQuestionById(props: TestById): Promise<Question> {
  const { questionId } = props;

  const response = await api.get<Question>(`/question/${questionId}`);

  return response.data;
}
