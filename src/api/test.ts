import { AxiosResponse } from "axios";

import {
  CreateTestPayload,
  Test,
  TestBasicInfo,
  TestUnpopulated,
  UpdateTestPayload,
} from "@/types/Test";

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

export async function createTest(
  payload: CreateTestPayload,
): Promise<AxiosResponse<Test>> {
  return api.post<Test>("/test", payload);
}

export async function updateTest(
  testId: string,
  payload: UpdateTestPayload,
): Promise<AxiosResponse<Test>> {
  return api.put<Test>(`/test/${testId}`, payload);
}

export async function getTestDetails(
  props: TestById,
): Promise<TestUnpopulated> {
  const { testId } = props;

  const response = await api.get<TestUnpopulated>(`/test/${testId}/details`);

  return response.data;
}
