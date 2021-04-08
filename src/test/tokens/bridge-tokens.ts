import { List } from 'immutable';
import { BlockchainsTokens, BridgeToken } from '../../app/features/bridge-page/models/BridgeToken';
import { BLOCKCHAIN_NAME } from '../../app/shared/models/blockchain/BLOCKCHAIN_NAME';

const RBC: BridgeToken = {
  symbol: 'RBC',
  image:
    'https://raw.githubusercontent.com/MyWishPlatform/etherscan_top_tokens_images/master/fa-empire.png',

  blockchainToken: {
    [BLOCKCHAIN_NAME.ETHEREUM]: {
      address: '0xc5228008c89dfb03937ff5ff9124f0d7bd2028f9',
      name: 'RBC',
      symbol: 'RBC',
      decimal: 18,

      minAmount: 200,
      maxAmount: 100000
    },
    [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: {
      address: '0xd51bd30a91f88dcf72acd45c8a1e7ae0066263e8',
      name: 'RBC',
      symbol: 'WRBC',
      decimal: 18,

      minAmount: 200,
      maxAmount: 100000
    }
  } as BlockchainsTokens,

  fromEthFee: 5,
  toEthFee: 100
};

const BAZ: BridgeToken = {
  symbol: 'Baz',
  image:
    'https://raw.githubusercontent.com/MyWishPlatform/etherscan_top_tokens_images/master/fa-empire.png',

  blockchainToken: {
    [BLOCKCHAIN_NAME.ETHEREUM]: {
      address: '0x2a45463986715cBd80A2Fb4F419BaBBba1e3a2d8',
      name: 'BAZ Token',
      symbol: 'Baz',
      decimal: 2,

      minAmount: 0,
      maxAmount: Infinity
    },
    [BLOCKCHAIN_NAME.POLYGON]: {
      address: '0x73a8e8602D51e25baF3be19e0339316ccd62072f',
      name: 'BAZ Token',
      symbol: 'Baz',
      decimal: 2,

      minAmount: 0,
      maxAmount: Infinity
    }
  } as BlockchainsTokens,

  fromEthFee: 0,
  toEthFee: 0
};

export const bridgeTestTokens = List([RBC, BAZ]);
