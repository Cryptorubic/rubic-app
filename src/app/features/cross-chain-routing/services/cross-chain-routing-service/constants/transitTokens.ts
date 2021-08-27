import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import InstantTradeToken from 'src/app/features/instant-trade/models/InstantTradeToken';

export type TransitTokens = {
  [BLOCKCHAIN_NAME.ETHEREUM]: InstantTradeToken;
  [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: InstantTradeToken;
  [BLOCKCHAIN_NAME.POLYGON]: InstantTradeToken;
};

export const transitTokensWithMode: { mainnet: TransitTokens; testnet: TransitTokens } = {
  mainnet: {
    [BLOCKCHAIN_NAME.ETHEREUM]: {
      address: '0x6b175474e89094c44da98b954eedeac495271d0f',
      decimals: 18,
      symbol: 'DAI'
    },
    [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: {
      address: '0x1af3f329e8be154074d8769d1ffa4ee058b1dbc3',
      decimals: 18,
      symbol: 'DAI'
    },
    [BLOCKCHAIN_NAME.POLYGON]: {
      address: '0x8f3cf7ad23cd3cadbd9735aff958023239c6a063',
      decimals: 18,
      symbol: 'DAI'
    }
  },
  testnet: {
    [BLOCKCHAIN_NAME.ETHEREUM]: {
      address: '0xaff4481d10270f50f203e0763e2597776068cbc5',
      decimals: 18,
      symbol: 'WEENUS'
    },
    [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: {
      address: '0x7ef95a0FEE0Dd31b22626fA2e10Ee6A223F8a684',
      decimals: 18,
      symbol: 'USDT'
    },
    [BLOCKCHAIN_NAME.POLYGON]: {
      address: '0x5aeb1bbcb4f83fdf2c440028b7725bdd358a9afc',
      decimals: 18,
      symbol: 'USDT'
    }
  }
};
