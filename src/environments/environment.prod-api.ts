import { crossChainProd } from 'src/environments/constants/crossChain';

export const environment = {
  production: false,
  environmentName: 'prod-api',
  apiBaseUrl: '//api.rubic.exchange/api',
  zrxAffiliateAddress: undefined as string,
  crossChain: crossChainProd
};
