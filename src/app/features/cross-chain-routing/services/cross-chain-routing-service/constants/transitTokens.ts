import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import InstantTradeToken from 'src/app/features/instant-trade/models/InstantTradeToken';
import { SupportedCrossChainSwapBlockchain } from 'src/app/features/cross-chain-routing/services/cross-chain-routing-service/models/SupportedCrossChainSwapBlockchain';

export type TransitTokens = Record<SupportedCrossChainSwapBlockchain, InstantTradeToken>;

export const transitTokensWithMode: TransitTokens = {
  [BLOCKCHAIN_NAME.ETHEREUM]: {
    address: '0xA4EED63db85311E22dF4473f87CcfC3DaDCFA3E3',
    decimals: 18,
    symbol: 'RBC'
  },
  [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: {
    address: '0x8E3BCC334657560253B83f08331d85267316e08a',
    decimals: 18,
    symbol: 'BRBC'
  },
  [BLOCKCHAIN_NAME.POLYGON]: {
    address: '0xc3cFFDAf8F3fdF07da6D5e3A89B8723D5E385ff8',
    decimals: 18,
    symbol: 'RBC'
  },
  [BLOCKCHAIN_NAME.AVALANCHE]: {
    address: '0xc7198437980c041c805A1EDcbA50c1Ce5db95118',
    decimals: 6,
    symbol: 'USDT.e'
  },
  [BLOCKCHAIN_NAME.MOONRIVER]: {
    address: '0xe3f5a90f9cb311505cd691a46596599aa1a0ad7d',
    decimals: 6,
    symbol: 'USDC'
  },
  [BLOCKCHAIN_NAME.FANTOM]: {
    address: '0x04068DA6C83AFCFA0e13ba15A6696662335D5B75',
    decimals: 6,
    symbol: 'USDC'
  }
};
