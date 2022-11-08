import { CROSS_CHAIN_PROD } from 'src/environments/constants/cross-chain';
import { STAKING_CONFIG_PROD } from './constants/staking';

export const ENVIRONMENT = {
  production: false,
  environmentName: 'prod-api',
  apiBaseUrl: '//api.rubic.exchange/api',
  apiTokenUrl: 'https://tokens.rubic.exchange/api/',
  zrxAffiliateAddress: undefined as string,
  crossChain: CROSS_CHAIN_PROD,
  staking: STAKING_CONFIG_PROD
};
