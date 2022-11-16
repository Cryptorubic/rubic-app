import { STAKING_CONFIG_DEVELOP } from './constants/staking';

export const ENVIRONMENT = {
  production: true,
  environmentName: 'stage',
  apiBaseUrl: '//stage-api.rubic.exchange/api',
  apiTokenUrl: 'https://tokens.rubic.exchange/api',
  zrxAffiliateAddress: undefined as string,
  staking: STAKING_CONFIG_DEVELOP
};
