import { CROSS_CHAIN_DEV } from 'src/environments/constants/cross-chain';
import { STAKING_CONFIG_DEVELOP } from './constants/staking';

export const ENVIRONMENT = {
  production: false,
  environmentName: 'dev2',
  apiBaseUrl: '//dev2-api.rubic.exchange/api',
  zrxAffiliateAddress: undefined as string,
  crossChain: CROSS_CHAIN_DEV,
  staking: STAKING_CONFIG_DEVELOP
};
