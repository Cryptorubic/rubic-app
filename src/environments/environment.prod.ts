import { STAKING_CONFIG_PROD } from './constants/staking';

export const ENVIRONMENT = {
  production: true,

  apiBaseUrl: '//testnet-api.rubic.exchange/api',
  apiTokenUrl: 'https://testnet-tokens.rubic.exchange/api',
  websocketBaseUrl: 'wss://api.rubic.exchange/ws',

  staking: STAKING_CONFIG_PROD,

  zrxAffiliateAddress: '0x19eBB148836B5f8A6320e42666912978B20D0Dbb',
  onramperApiKey: 'pk_prod_01GYYB6KDFQCKYG23MHZ8QK5GC'
};
