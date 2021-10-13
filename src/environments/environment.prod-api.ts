import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';

export const environment = {
  production: false,
  environmentName: 'prod-api',
  apiBaseUrl: '//api.rubic.exchange/api',
  crossChainApiBaseUrl: 'https://crosschain.rubic.exchange/api',
  crossChain: {
    apiBaseUrl: 'https://crosschain.rubic.exchange/api',
    contractAddresses: {
      [BLOCKCHAIN_NAME.ETHEREUM]: '0xb9a94be803eC1197A234406eF5c0113f503d3178',
      [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: '0xA9e72A4B449CA000994E1B9A1DE5994e24fb3511',
      [BLOCKCHAIN_NAME.POLYGON]: '0xfaed2233b783790d3BB7c1fDA60b41d1bF775A79',
      [BLOCKCHAIN_NAME.AVALANCHE]: '0x3645Dca27D9f5Cf5ee0d6f52EE53ae366e4ceAc2'
    }
  }
};
