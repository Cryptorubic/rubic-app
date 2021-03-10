import { UserInterface } from './user.interface';

export const DEFAULT_USER = <UserInterface>{
  username: '',
  contracts: 0,
  is_ghost: true,
  balance: 0,
  eos_balance: 0,
  visibleBalance: '0',
  internal_btc_address: '',
  use_totp: false,
  internal_address: '',
  eos_address: '',
  id: 0,
  is_social: false,
  lang: 'en',
  memo: ''
};

export const SOCIAL_KEYS = {
  GOOGLE: '145060606284-c6ep1vk9rbrni42u4pnvqls551qsfjfi.apps.googleusercontent.com',
  FACEBOOK: '608463682954705'
};
