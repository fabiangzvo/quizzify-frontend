import { TestBasicInfo } from "@/types/Test";

import api from "./QuizzifyApi";

export async function getAllTest(): Promise<Array<TestBasicInfo>> {
  const response = await api.get<Array<TestBasicInfo>>("/test");

  return response.data;
}
