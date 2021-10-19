import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';

export const environment = {
  production: false,
  environmentName: 'dev2',
  apiBaseUrl: '//dev2-api.rubic.exchange/api',
  zrxAffiliateAddress: undefined as string,
  crossChain: {
    apiBaseUrl: 'https://dev-crosschain.rubic.exchange/api',
    contractAddresses: {
      [BLOCKCHAIN_NAME.ETHEREUM]: '0xb9a94be803eC1197A234406eF5c0113f503d3178',
      [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: '0x6b8904739059afbaa91311aab99187f5885c6dc0',
      [BLOCKCHAIN_NAME.POLYGON]: '0xb02c0b6ba0e7719de2d44e613fc4ad01ac2f60ad',
      [BLOCKCHAIN_NAME.AVALANCHE]: '0x3df5f6165fe8429744F9488a9C18259E9a93B4C0'
    }
  }
};
