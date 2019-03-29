import {UserInterface} from './user.interface';

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
  'GOOGLE': '448526667030-rfiiqfee3f0eils8nha266n43kp1pbac.apps.googleusercontent.com',
  'FACEBOOK': '438113386623173'
};
