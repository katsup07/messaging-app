export type AuthResponse = {
  user: {
    _id: string;
    username: string;
    email: string;
  };
  accessToken: string;
  refreshToken: string;
}

export type AuthCredentials = {
  email: string;
  password: string;
  isSignup: boolean;
}

export type RefreshTokenResponse = {
  newAccessToken: string;
  newRefreshToken: string;
}
