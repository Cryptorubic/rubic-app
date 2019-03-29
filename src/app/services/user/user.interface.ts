export interface UserInterface {
  isLogout?: boolean;
  balance: number;
  eos_balance: number;
  visibleBalance: string;
  contracts: number;
  eos_address: string;
  id: number;
  internal_address: string;
  internal_btc_address: string;
  is_social: boolean;
  lang: string;
  memo: string;
  use_totp: boolean;
  username: string;
  is_ghost?: boolean;
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
