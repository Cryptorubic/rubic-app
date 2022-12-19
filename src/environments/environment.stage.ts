import { STAKING_CONFIG_DEVELOP } from './constants/staking';

export const ENVIRONMENT = {
  environmentName: 'stage',
  production: true,

  apiBaseUrl: '//stage-api.rubic.exchange/api',
  apiTokenUrl: 'https://tokens.rubic.exchange/api',

  staking: STAKING_CONFIG_DEVELOP,

  zrxAffiliateAddress: undefined as string,
  onramperApiKey: 'pk_prod_LaMdFaqZ1NjYCDWPAOz9uOm_Ed0pKF0tgBkSUUOrVnY0'
};
