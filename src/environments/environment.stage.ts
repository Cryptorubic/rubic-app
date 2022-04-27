import { CROSS_CHAIN_PROD } from 'src/environments/constants/cross-chain';
import { LP_PROVIDING_CONFIG_DEVELOP } from './constants/lp-providing';
import { STAKING_CONFIG_DEVELOP } from './constants/staking';

export const ENVIRONMENT = {
  production: true,
  environmentName: 'stage',
  apiBaseUrl: '//stage-api.rubic.exchange/api',
  zrxAffiliateAddress: undefined as string,
  crossChain: CROSS_CHAIN_PROD,
  staking: STAKING_CONFIG_DEVELOP,
  lpProviding: LP_PROVIDING_CONFIG_DEVELOP
};
