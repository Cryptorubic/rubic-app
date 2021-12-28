import { CROSS_CHAIN_PROD } from 'src/environments/constants/crossChain';
import { STAKING_CONFIG_DEVELOP } from './constants/staking';

export const ENVIRONMENT = {
  production: true,
  environmentName: 'stage',
  apiBaseUrl: '//stage-api.rubic.exchange/api',
  zrxAffiliateAddress: undefined as string,
  crossChain: CROSS_CHAIN_PROD,
  staking: STAKING_CONFIG_DEVELOP
};
