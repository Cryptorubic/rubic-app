import { ChainType } from '@cryptorubic/core';

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
  avatar?: string;
  name?: string;
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
