import { crossChainProd } from 'src/environments/constants/crossChain';
import { stakingConfigDevelop } from './constants/staking';

export const environment = {
  production: true,
  environmentName: 'stage',
  apiBaseUrl: '//stage-api.rubic.exchange/api',
  zrxAffiliateAddress: undefined as string,
  crossChain: crossChainProd,
  staking: stakingConfigDevelop
};
