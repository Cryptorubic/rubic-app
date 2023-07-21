import { STAKING_CONFIG_PROD } from './constants/staking';

export const ENVIRONMENT = {
  environmentName: 'prod-api',
  production: false,

  apiBaseUrl: '//api.rubic.exchange/api',
  testBaseUrl: '//testnet-api.rubic.exchange/api',
  apiTokenUrl: 'https://tokens.rubic.exchange/api',
  testTokenUrl: 'https://testnet-tokens.rubic.exchange/api',
  websocketBaseUrl: 'wss://api.rubic.exchange/ws',

  staking: STAKING_CONFIG_PROD,

  zrxAffiliateAddress: undefined as string,
  onramperApiKey: 'pk_prod_01GYYB6KDFQCKYG23MHZ8QK5GC'
};
