import { List } from 'immutable';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { TOKEN_RANK } from 'src/app/shared/models/tokens/TOKEN_RANK';
import { BlockchainsTokens, BridgeToken } from 'src/app/features/bridge/models/BridgeToken';
import { BlockchainsBridgeTokens } from 'src/app/features/bridge/models/BlockchainsBridgeTokens';

const RBC: BridgeToken = {
  symbol: 'RBC',
  image:
    'https://raw.githubusercontent.com/MyWishPlatform/etherscan_top_tokens_images/master/fa-empire.png',
  rank: TOKEN_RANK.HIGH,

  blockchainToken: {
    [BLOCKCHAIN_NAME.ETHEREUM]: {
      address: '0xc5228008c89dfb03937ff5ff9124f0d7bd2028f9',
      name: 'Rubic',
      symbol: 'RBC',
      decimals: 18,

      minAmount: 200,
      maxAmount: 100000
    },
    [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: {
      address: '0xd51bd30a91f88dcf72acd45c8a1e7ae0066263e8',
      name: 'Rubic',
      symbol: 'WRBC',
      decimals: 18,

      minAmount: 200,
      maxAmount: 100000
    }
  } as BlockchainsTokens,

  fromEthFee: 5,
  toEthFee: 100
};

export const bridgeTestTokens: BlockchainsBridgeTokens[] = [
  {
    fromBlockchain: BLOCKCHAIN_NAME.ETHEREUM,
    toBlockchain: BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN,
    bridgeTokens: List([RBC])
  },
  {
    fromBlockchain: BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN,
    toBlockchain: BLOCKCHAIN_NAME.ETHEREUM,
    bridgeTokens: List([RBC])
  }
];
