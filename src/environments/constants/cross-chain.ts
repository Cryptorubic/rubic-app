import { BLOCKCHAIN_NAME } from '@shared/models/blockchain/blockchain-name';
import { SupportedCrossChainBlockchain } from '@features/cross-chain-routing/services/cross-chain-routing-service/models/supported-cross-chain-blockchain';

type CrossChainConstants = {
  apiBaseUrl: string;
  contractAddresses: Record<SupportedCrossChainBlockchain, string>;
};

export const CROSS_CHAIN_DEV: CrossChainConstants = {
  apiBaseUrl: 'https://dev-crosschain.rubic.exchange/api',
  contractAddresses: {
    [BLOCKCHAIN_NAME.ETHEREUM]: '0xD8b19613723215EF8CC80fC35A1428f8E8826940',
    [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: '0xEda6DdA4fD1581B6Ab8951750DB596566d0FBf9C',
    [BLOCKCHAIN_NAME.POLYGON]: '0xeC52A30E4bFe2D6B0ba1D0dbf78f265c0a119286',
    [BLOCKCHAIN_NAME.AVALANCHE]: '0x541eC7c03F330605a2176fCD9c255596a30C00dB',
    [BLOCKCHAIN_NAME.MOONRIVER]: '0xD8b19613723215EF8CC80fC35A1428f8E8826940',
    [BLOCKCHAIN_NAME.FANTOM]: '0x55Be05ecC1c417B16163b000CB71DcE8526a5D06',
    [BLOCKCHAIN_NAME.HARMONY]: '0xd8b19613723215ef8cc80fc35a1428f8e8826940',
    [BLOCKCHAIN_NAME.SOLANA]: 'J5TctkSdzSmjHgqxYEwBB1XsRQomrvghEuk1AVkkUWuG'
  }
};

export const CROSS_CHAIN_PROD: CrossChainConstants = {
  apiBaseUrl: 'https://crosschain.rubic.exchange/api',
  contractAddresses: {
    [BLOCKCHAIN_NAME.ETHEREUM]: '0xD8b19613723215EF8CC80fC35A1428f8E8826940',
    [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: '0x70e8C8139d1ceF162D5ba3B286380EB5913098c4',
    [BLOCKCHAIN_NAME.POLYGON]: '0xeC52A30E4bFe2D6B0ba1D0dbf78f265c0a119286',
    [BLOCKCHAIN_NAME.AVALANCHE]: '0x541eC7c03F330605a2176fCD9c255596a30C00dB',
    [BLOCKCHAIN_NAME.MOONRIVER]: '0xD8b19613723215EF8CC80fC35A1428f8E8826940',
    [BLOCKCHAIN_NAME.FANTOM]: '0xd23B4dA264A756F427e13C72AB6cA5A6C95E4608',
    [BLOCKCHAIN_NAME.HARMONY]: '0x5681012ccc3ec5bafefac21ce4280ad7fe22bbf2',
    [BLOCKCHAIN_NAME.SOLANA]: 'J5TctkSdzSmjHgqxYEwBB1XsRQomrvghEuk1AVkkUWuG'
  }
};
