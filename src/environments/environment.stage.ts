import { crossChainProd } from 'src/environments/constants/crossChain';

export const environment = {
  production: true,
  environmentName: 'stage',
  apiBaseUrl: '//stage-api.rubic.exchange/api',
  zrxAffiliateAddress: undefined as string,
  crossChain: crossChainProd
};
