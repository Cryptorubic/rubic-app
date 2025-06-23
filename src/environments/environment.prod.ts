import { STAKING_CONFIG_PROD } from './constants/staking';
import { Env } from './models/env';

export const ENVIRONMENT: Env = {
  environmentName: 'prod',
  production: true,

  apiBaseUrl: '//api.rubic.exchange/api',
  apiTokenUrl: 'https://api.rubic.exchange/api',
  websocketBaseUrl: 'wss://api.rubic.exchange/ws',
  testnetUrl: '//testnet-api.rubic.exchange/api',

  staking: STAKING_CONFIG_PROD,

  zrxAffiliateAddress: '0x19eBB148836B5f8A6320e42666912978B20D0Dbb',
  onramperApiKey: 'pk_prod_01GYYB6KDFQCKYG23MHZ8QK5GC',
  lifiApiKey: '0a1eec2c-b1bd-4dc1-81cf-c988f099c929.f5950d26-5955-4e21-9db2-77ad984ea575'
};
