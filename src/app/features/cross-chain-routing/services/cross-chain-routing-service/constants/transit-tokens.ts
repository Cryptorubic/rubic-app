import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import InstantTradeToken from 'src/app/features/instant-trade/models/InstantTradeToken';
import { SupportedCrossChainBlockchain } from '@features/cross-chain-routing/services/cross-chain-routing-service/models/supported-cross-chain-blockchain';
import { TOKENS } from '@features/instant-trade/services/instant-trade-service/providers/solana/raydium-service/models/tokens';

export type TransitTokens = Record<SupportedCrossChainBlockchain, InstantTradeToken>;

export const transitTokens: TransitTokens = {
  [BLOCKCHAIN_NAME.ETHEREUM]: {
    address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
    decimals: 6,
    symbol: 'USDC'
  },
  [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: {
    address: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
    decimals: 18,
    symbol: 'USDC'
  },
  [BLOCKCHAIN_NAME.POLYGON]: {
    address: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
    decimals: 6,
    symbol: 'USDC'
  },
  [BLOCKCHAIN_NAME.AVALANCHE]: {
    address: '0xA7D7079b0FEaD91F3e65f86E8915Cb59c1a4C664',
    decimals: 6,
    symbol: 'USDC.e'
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
  },
  [BLOCKCHAIN_NAME.SOLANA]: {
    address: TOKENS.USDC.mintAddress,
    decimals: TOKENS.USDC.decimals,
    symbol: TOKENS.USDC.symbol
  }
};
