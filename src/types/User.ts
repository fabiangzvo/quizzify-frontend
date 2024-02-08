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
  _id: String;
  fullName: string;
  userName: string;
  email: string;
}
