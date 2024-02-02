import { CompleteResume, Resume } from "@/types/Resume";

import api from "./quizzifyApi";

export async function postResume(
  resume: Resume
): Promise<Array<CompleteResume>> {
  const response = await api.post<Array<CompleteResume>>("/resume", resume);

  return response.data;
}
