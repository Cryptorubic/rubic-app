import { ChainType } from 'rubic-sdk';

export interface WalletLoginInterface {
  code: string;
  payload: {
    user?: {
      address: string;
    };
    message?: string;
  };
}

export interface UserInterface {
  address: string;
  chainType: ChainType;
}

export interface AuthUserInterface {
  username: string;
  password: string;
}

export interface SocialUserInterface {
  access_token: string;
  totp?: string;
  username?: undefined;
}
