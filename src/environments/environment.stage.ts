import { STAKING_CONFIG_DEVELOP } from './constants/staking';

export const ENVIRONMENT = {
  environmentName: 'stage',
  production: true,

  apiBaseUrl: '//testnet-api.rubic.exchange/api',
  apiTokenUrl: 'https://testnet-tokens.rubic.exchange/api',
  websocketBaseUrl: 'wss://api.rubic.exchange/ws',

  staking: STAKING_CONFIG_DEVELOP,

  zrxAffiliateAddress: undefined as string,
  onramperApiKey: 'pk_prod_01GYYB6KDFQCKYG23MHZ8QK5GC'
};
