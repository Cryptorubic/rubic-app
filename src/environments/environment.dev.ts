import { STAKING_CONFIG_DEVELOP } from './constants/staking';
import { Env } from './models/env';

export const ENVIRONMENT: Env = {
  environmentName: 'dev',
  production: false,

  apiBaseUrl: '//dev-api.rubic.exchange/api',
  apiTokenUrl: 'https://dev-api.rubic.exchange/api',
  websocketBaseUrl: 'wss://dev-api.rubic.exchange/ws',
  testnetUrl: '//dev-testnet-api.rubic.exchange/api',

  staking: STAKING_CONFIG_DEVELOP,

  zrxAffiliateAddress: undefined as string,
  onramperApiKey: 'pk_prod_01H03RG3KT4TEKY80D82R1N4ZS',
  lifiApiKey: '0a1eec2c-b1bd-4dc1-81cf-c988f099c929.f5950d26-5955-4e21-9db2-77ad984ea575'
};
