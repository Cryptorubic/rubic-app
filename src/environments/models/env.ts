import { STAKING_CONFIG_DEVELOP } from '../constants/staking';

export interface Env {
  environmentName: string;
  production: boolean;

  apiBaseUrl: string;
  apiTokenUrl: string;
  websocketBaseUrl: string;
  testnetUrl: string;

  staking: typeof STAKING_CONFIG_DEVELOP;

  zrxAffiliateAddress: string;
  onramperApiKey: string;
  lifiApiKey: string;
}
