import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { SupportedCrossChainSwapBlockchain } from '@features/cross-chain-routing/services/cross-chain-routing-service/models/SupportedCrossChainSwapBlockchain';

type CrossChainConstants = {
  apiBaseUrl: string;
  contractAddresses: Record<SupportedCrossChainSwapBlockchain, string[]>;
};

export const crossChainDev: CrossChainConstants = {
  apiBaseUrl: 'https://dev-crosschain.rubic.exchange/api',
  contractAddresses: {
    [BLOCKCHAIN_NAME.ETHEREUM]: ['0xb9a94be803eC1197A234406eF5c0113f503d3178'],
    [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: ['0x73C6e728EEE462270c5eEC5d8F753442dA7c4068'],
    [BLOCKCHAIN_NAME.POLYGON]: ['0x0459d4Bb49a713C4672eB95686a2F2715B6D8528'],
    [BLOCKCHAIN_NAME.AVALANCHE]: [
      '0x1EE4144A707D0896F9594030f5D9af6935C80013',
      '0x9375e3B9623610919750257C3A8667A62533bc93'
    ],
    [BLOCKCHAIN_NAME.MOONRIVER]: ['0x3645Dca27D9f5Cf5ee0d6f52EE53ae366e4ceAc2'],
    [BLOCKCHAIN_NAME.FANTOM]: ['0xeDfA29ca1BdbFaCBBDc6AAda385c983020015177']
  }
};

export const crossChainProd: CrossChainConstants = {
  apiBaseUrl: 'https://crosschain.rubic.exchange/api',
  contractAddresses: {
    [BLOCKCHAIN_NAME.ETHEREUM]: ['0xb9a94be803eC1197A234406eF5c0113f503d3178'],
    [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: ['0x73C6e728EEE462270c5eEC5d8F753442dA7c4068'],
    [BLOCKCHAIN_NAME.POLYGON]: ['0x0459d4Bb49a713C4672eB95686a2F2715B6D8528'],
    [BLOCKCHAIN_NAME.AVALANCHE]: [
      '0x3df5f6165fe8429744F9488a9C18259E9a93B4C0',
      '0x792f2C5862b17624dE606A7d822DddC0BA91A0bC'
    ],
    [BLOCKCHAIN_NAME.MOONRIVER]: ['0x3645Dca27D9f5Cf5ee0d6f52EE53ae366e4ceAc2'],
    [BLOCKCHAIN_NAME.FANTOM]: ['0xeDfA29ca1BdbFaCBBDc6AAda385c983020015177']
  }
};
