import { crossChainProd } from 'src/environments/constants/crossChain';
import { stakingConfigProd } from './constants/staking';

export const environment = {
  production: true,
  apiBaseUrl: '//api.rubic.exchange/api',
  zrxAffiliateAddress: '0x19eBB148836B5f8A6320e42666912978B20D0Dbb',
  crossChain: crossChainProd,
  staking: stakingConfigProd
};
