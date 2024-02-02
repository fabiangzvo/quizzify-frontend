import { TestBasicInfo, TestUnpopulated } from "@/types/Test";

import api from "./quizzifyApi";

interface TestById {
  testId: string;
}

export async function getAllTest(): Promise<Array<TestBasicInfo>> {
  const response = await api.get<Array<TestBasicInfo>>("/test");

  return response.data;
}

export async function getTestById(props: TestById): Promise<TestUnpopulated> {
  const { testId } = props;

  const response = await api.get<TestUnpopulated>(`/test/${testId}`);

  return response.data;
}
