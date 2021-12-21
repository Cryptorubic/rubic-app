import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { SupportedCrossChainBlockchain } from '@features/cross-chain-routing/services/cross-chain-routing-service/models/supported-cross-chain-blockchain';

type CrossChainConstants = {
  apiBaseUrl: string;
  contractAddresses: Record<SupportedCrossChainBlockchain, string>;
};

export const crossChainDev: CrossChainConstants = {
  apiBaseUrl: 'https://dev-crosschain.rubic.exchange/api',
  contractAddresses: {
    [BLOCKCHAIN_NAME.ETHEREUM]: '0xb9a94be803eC1197A234406eF5c0113f503d3178',
    [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: '0x6b8904739059afbaa91311aab99187f5885c6dc0',
    [BLOCKCHAIN_NAME.POLYGON]: '0xF19180f70f334bf139c5A61D1e5febd47aaBc200',
    [BLOCKCHAIN_NAME.AVALANCHE]: '0x3df5f6165fe8429744F9488a9C18259E9a93B4C0',
    [BLOCKCHAIN_NAME.MOONRIVER]: '0x3645Dca27D9f5Cf5ee0d6f52EE53ae366e4ceAc2',
    [BLOCKCHAIN_NAME.FANTOM]: '0xeDfA29ca1BdbFaCBBDc6AAda385c983020015177',
    [BLOCKCHAIN_NAME.SOLANA]: 'J5TctkSdzSmjHgqxYEwBB1XsRQomrvghEuk1AVkkUWuG'
  }
};

export const crossChainProd: CrossChainConstants = {
  apiBaseUrl: 'https://crosschain.rubic.exchange/api',
  contractAddresses: {
    [BLOCKCHAIN_NAME.ETHEREUM]: '0xb9a94be803eC1197A234406eF5c0113f503d3178',
    [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: '0xA9e72A4B449CA000994E1B9A1DE5994e24fb3511',
    [BLOCKCHAIN_NAME.POLYGON]: '0xF19180f70f334bf139c5A61D1e5febd47aaBc200',
    [BLOCKCHAIN_NAME.AVALANCHE]: '0x3df5f6165fe8429744F9488a9C18259E9a93B4C0',
    [BLOCKCHAIN_NAME.MOONRIVER]: '0x3645Dca27D9f5Cf5ee0d6f52EE53ae366e4ceAc2',
    [BLOCKCHAIN_NAME.FANTOM]: '0xeDfA29ca1BdbFaCBBDc6AAda385c983020015177',
    [BLOCKCHAIN_NAME.SOLANA]: 'J5TctkSdzSmjHgqxYEwBB1XsRQomrvghEuk1AVkkUWuG'
  }
};
