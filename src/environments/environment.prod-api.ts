import { crossChainProd } from 'src/environments/constants/crossChain';
import { stakingConfigProd } from './constants/staking';

export const environment = {
  production: false,
  environmentName: 'prod-api',
  apiBaseUrl: '//api.rubic.exchange/api',
  zrxAffiliateAddress: undefined as string,
  crossChain: crossChainProd,
  staking: stakingConfigProd
};
