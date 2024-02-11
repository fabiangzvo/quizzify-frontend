export interface UserSignIn {
  email: string;
  password: string;
}

export interface UserSignUp {
  email: string;
  password: string;
}

export interface UserSigned {
  expirationTime: number;
  accessToken: string;
  _id: string;
  fullName: string;
  userName: string;
  email: string;
  createdAt: string;
}

export type UserProfile = Omit<UserSigned, "accessToken" | "expirationTime">;
