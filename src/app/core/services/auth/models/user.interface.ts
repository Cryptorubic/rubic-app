export interface UserInterface {
  address: string;
}

export interface AuthUserInterface {
  username: string;
  password: string;
}

export interface NewUserInterface {
  username: string;
  email: string;
  password1: string;
  password2: string;
}

export interface SocialUserInterface {
  access_token: string;
  totp?: string;
  username?: undefined;
}
