import { UserSignIn, UserSignUp, UserSigned, UserProfile } from "@/types/User";
import { AxiosResponse } from "axios";

import api from "./quizzifyApi";

export async function postSignIn(
  userCredentials: UserSignIn
): Promise<AxiosResponse<UserSigned>> {
  return api.post<UserSigned>("/user/sign-in", userCredentials);
}

export async function postSignUp(
  userInfo: UserSignUp
): Promise<AxiosResponse<UserSigned>> {
  return api.post<UserSigned>("/user/sign-up", userInfo);
}

export async function getProfile(): Promise<AxiosResponse<UserProfile>> {
  return api.get<UserProfile>("/user/");
}
