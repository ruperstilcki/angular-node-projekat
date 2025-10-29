export interface AuthData {
  email: string;
  password: string;
}

export interface AuthDataResponse {
  token: string;
  expiresIn: number;
  userId: string;
}

export interface AuthServiceDataModel {
  token: string;
  expirationDate: Date;
  userId: string;
}
