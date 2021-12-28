import { crossChainDev } from 'src/environments/constants/crossChain';
import { stakingConfigDevelop } from './constants/staking';

export const environment = {
  production: false,
  environmentName: 'dev2',
  apiBaseUrl: '//dev2-api.rubic.exchange/api',
  zrxAffiliateAddress: undefined as string,
  crossChain: crossChainDev,
  staking: stakingConfigDevelop
};
