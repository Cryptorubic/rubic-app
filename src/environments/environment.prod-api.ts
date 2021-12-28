import { CROSS_CHAIN_PROD } from 'src/environments/constants/crossChain';
import { STAKING_CONFIG_PROD } from './constants/staking';

export const ENVIRONMENT = {
  production: false,
  environmentName: 'prod-api',
  apiBaseUrl: '//api.rubic.exchange/api',
  zrxAffiliateAddress: undefined as string,
  crossChain: CROSS_CHAIN_PROD,
  staking: STAKING_CONFIG_PROD
};
