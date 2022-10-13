import { STAKING_CONFIG_PROD } from './constants/staking';

export const ENVIRONMENT = {
  production: false,
  environmentName: 'prod-api',
  apiBaseUrl: '//api.rubic.exchange/api',
  zrxAffiliateAddress: undefined as string,
  staking: STAKING_CONFIG_PROD
};
