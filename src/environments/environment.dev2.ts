import { STAKING_CONFIG_DEVELOP } from './constants/staking';

export const ENVIRONMENT = {
  production: false,
  environmentName: 'dev2',
  apiBaseUrl: '//dev2-api.rubic.exchange/api',
  apiTokenUrl: 'https://dev-tokens.rubic.exchange/api',
  zrxAffiliateAddress: undefined as string,
  staking: STAKING_CONFIG_DEVELOP
};
