import { CROSS_CHAIN_PROD } from 'src/environments/constants/cross-chain';
import { STAKING_CONFIG_PROD } from './constants/staking';

export const ENVIRONMENT = {
  production: true,
  apiBaseUrl: '//api.rubic.exchange/api',
  apiTokenUrl: 'https://tokens.rubic.exchange/api/',
  zrxAffiliateAddress: '0x19eBB148836B5f8A6320e42666912978B20D0Dbb',
  crossChain: CROSS_CHAIN_PROD,
  staking: STAKING_CONFIG_PROD
};
