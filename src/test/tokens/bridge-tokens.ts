import { List } from 'immutable';
import { BlockchainsTokens, BridgeToken } from '../../app/features/bridge-page/models/BridgeToken';
import { BLOCKCHAIN_NAME } from '../../app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { NATIVE_TOKEN_ADDRESS } from '../../app/shared/constants/blockchain/NATIVE_TOKEN_ADDRESS';
import { TOKEN_RANK } from '../../app/shared/models/tokens/token-rank';

const RBC: BridgeToken = {
  symbol: 'RBC',
  image:
    'https://raw.githubusercontent.com/MyWishPlatform/etherscan_top_tokens_images/master/fa-empire.png',
  rank: TOKEN_RANK.HIGH,

  blockchainToken: {
    [BLOCKCHAIN_NAME.ETHEREUM]: {
      address: '0xc5228008c89dfb03937ff5ff9124f0d7bd2028f9',
      name: 'RBC',
      symbol: 'RBC',
      decimals: 18,

      minAmount: 200,
      maxAmount: 100000
    },
    [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: {
      address: '0xd51bd30a91f88dcf72acd45c8a1e7ae0066263e8',
      name: 'RBC',
      symbol: 'WRBC',
      decimals: 18,

      minAmount: 200,
      maxAmount: 100000
    }
  } as BlockchainsTokens,

  fromEthFee: 5,
  toEthFee: 100
};

const ETH_POL: BridgeToken = {
  symbol: 'ETH',
  image:
    'https://raw.githubusercontent.com/MyWishPlatform/etherscan_top_tokens_images/master/fa-empire.png',
  rank: TOKEN_RANK.HIGH,

  blockchainToken: {
    [BLOCKCHAIN_NAME.ETHEREUM]: {
      address: NATIVE_TOKEN_ADDRESS,
      name: 'Ethereum - Polygon',
      symbol: 'ETH',
      decimals: 18,

      minAmount: 0,
      maxAmount: Infinity
    },
    [BLOCKCHAIN_NAME.POLYGON]: {
      address: '0xA6FA4fB5f76172d178d61B04b0ecd319C5d1C0aa',
      name: 'Ethereum - Polygon',
      symbol: 'WETH',
      decimals: 18,

      minAmount: 0,
      maxAmount: Infinity
    }
  } as BlockchainsTokens,

  fromEthFee: 0,
  toEthFee: 0
};

const WETH: BridgeToken = {
  symbol: 'WETH',
  image:
    'https://raw.githubusercontent.com/MyWishPlatform/etherscan_top_tokens_images/master/fa-empire.png',
  rank: TOKEN_RANK.LOW,

  blockchainToken: {
    [BLOCKCHAIN_NAME.ETHEREUM]: {
      address: '0xb4fbf271143f4fbf7b91a5ded31805e42b2208d6',
      name: 'Wrapped Ether',
      symbol: 'WETH',
      decimals: 18,

      minAmount: 0,
      maxAmount: Infinity
    },
    [BLOCKCHAIN_NAME.POLYGON]: {
      address: '0xE8F3118fDB41edcFEF7bF1DCa8009Fa8274aa070',
      name: 'Wrapped Ether (PoS)',
      symbol: 'WETH',
      decimals: 18,

      minAmount: 0,
      maxAmount: Infinity
    }
  } as BlockchainsTokens,

  fromEthFee: 0,
  toEthFee: 0
};

export const bridgeTestTokens = {
  [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: List([RBC]),
  [BLOCKCHAIN_NAME.POLYGON]: List([ETH_POL, WETH])
};
