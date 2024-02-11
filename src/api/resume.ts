import { CompleteResume, Resume } from "@/types/Resume";

import api from "./quizzifyApi";

interface getResumeProps {
  userId: string;
}

export async function postResume(
  resume: Resume
): Promise<Array<CompleteResume>> {
  const response = await api.post<Array<CompleteResume>>("/resume", resume);

  return response.data;
}

export async function getResumeByUserId(
  props: getResumeProps
): Promise<Array<Resume>> {
  const { userId } = props;

  const response = await api.get<Array<Resume>>("/resume", {
    params: { userId },
  });

  return response.data;
}