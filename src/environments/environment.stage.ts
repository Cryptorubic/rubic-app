import { STAKING_CONFIG_DEVELOP } from './constants/staking';
import { Env } from './models/env';

export const ENVIRONMENT: Env = {
  environmentName: 'rubic',
  production: true,

  apiBaseUrl: '//stage-api.rubic.exchange/api',
  apiTokenUrl: 'https://stage-api.rubic.exchange/api',
  websocketBaseUrl: 'wss://api.rubic.exchange/ws',
  testnetUrl: '//testnet-api.rubic.exchange/api',

  staking: STAKING_CONFIG_DEVELOP,

  zrxAffiliateAddress: undefined as string,
  onramperApiKey: 'pk_prod_01GYYB6KDFQCKYG23MHZ8QK5GC',
  lifiApiKey: '0a1eec2c-b1bd-4dc1-81cf-c988f099c929.f5950d26-5955-4e21-9db2-77ad984ea575'
};
