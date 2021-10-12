import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';

export const environment = {
  production: false,
  environmentName: 'dev2',
  apiBaseUrl: '//dev2-api.rubic.exchange/api',
  crossChainApiBaseUrl: 'https://dev-crosschain.rubic.exchange/api',
  zrxAffiliateAddress: undefined as string,
  ccrContractAddresses: {
    [BLOCKCHAIN_NAME.ETHEREUM]: undefined as string,
    [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: '0x6b8904739059afbaa91311aab99187f5885c6dc0',
    [BLOCKCHAIN_NAME.POLYGON]: '0xb02c0b6ba0e7719de2d44e613fc4ad01ac2f60ad',
    [BLOCKCHAIN_NAME.AVALANCHE]: '0x3645dca27d9f5cf5ee0d6f52ee53ae366e4ceac2'
  }
};
