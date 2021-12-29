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
    [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: '0xEda6DdA4fD1581B6Ab8951750DB596566d0FBf9C',
    [BLOCKCHAIN_NAME.POLYGON]: '0xe6625BBE80710C7Bb473721EdAC24Ce326940a6f',
    [BLOCKCHAIN_NAME.AVALANCHE]: '0xd23B4dA264A756F427e13C72AB6cA5A6C95E4608',
    [BLOCKCHAIN_NAME.MOONRIVER]: '0x3645Dca27D9f5Cf5ee0d6f52EE53ae366e4ceAc2',
    [BLOCKCHAIN_NAME.FANTOM]: '0x55Be05ecC1c417B16163b000CB71DcE8526a5D06',
    [BLOCKCHAIN_NAME.HARMONY]: '0xd8b19613723215ef8cc80fc35a1428f8e8826940',
    [BLOCKCHAIN_NAME.SOLANA]: 'J5TctkSdzSmjHgqxYEwBB1XsRQomrvghEuk1AVkkUWuG'
  }
};

export const crossChainProd: CrossChainConstants = {
  apiBaseUrl: 'https://crosschain.rubic.exchange/api',
  contractAddresses: {
    [BLOCKCHAIN_NAME.ETHEREUM]: '0xb9a94be803eC1197A234406eF5c0113f503d3178',
    [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: '0xEda6DdA4fD1581B6Ab8951750DB596566d0FBf9C',
    [BLOCKCHAIN_NAME.POLYGON]: '0xe6625BBE80710C7Bb473721EdAC24Ce326940a6f',
    [BLOCKCHAIN_NAME.AVALANCHE]: '0xd23B4dA264A756F427e13C72AB6cA5A6C95E4608',
    [BLOCKCHAIN_NAME.MOONRIVER]: '0x3645Dca27D9f5Cf5ee0d6f52EE53ae366e4ceAc2',
    [BLOCKCHAIN_NAME.FANTOM]: '0x55Be05ecC1c417B16163b000CB71DcE8526a5D06',
    [BLOCKCHAIN_NAME.HARMONY]: '0xd8b19613723215ef8cc80fc35a1428f8e8826940',
    [BLOCKCHAIN_NAME.SOLANA]: 'J5TctkSdzSmjHgqxYEwBB1XsRQomrvghEuk1AVkkUWuG'
  }
};
