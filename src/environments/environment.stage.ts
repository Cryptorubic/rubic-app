import { STAKING_CONFIG_DEVELOP } from './constants/staking';

export const ENVIRONMENT = {
  environmentName: 'stage',
  production: true,

  apiBaseUrl: '//stage-api.rubic.exchange/api',
  apiTokenUrl: 'https://tokens.rubic.exchange/api',
  websocketBaseUrl: 'wss://api.rubic.exchange/ws',

  staking: STAKING_CONFIG_DEVELOP,

  zrxAffiliateAddress: undefined as string,
  onramperApiKey: 'pk_prod_uVtMVURrIdlIx07oWT3Z2dvPJtTYXHJ9aRhX0WKKyfI0'
};
