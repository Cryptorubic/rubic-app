import { List } from 'immutable';
import { TOKEN_RANK } from '@shared/models/tokens/token-rank';
import { BridgeTokenPair } from '@features/bridge/models/bridge-token-pair';
import { BridgeTokenPairsByBlockchains } from '@features/bridge/models/bridge-token-pairs-by-blockchains';
import { BLOCKCHAIN_NAME } from '@shared/models/blockchain/blockchain-name';

const RBC: BridgeTokenPair = {
  symbol: 'RBC',
  image:
    'https://raw.githubusercontent.com/MyWishPlatform/etherscan_top_tokens_images/master/fa-empire.png',
  rank: TOKEN_RANK.HIGH,

  tokenByBlockchain: {
    [BLOCKCHAIN_NAME.ETHEREUM]: {
      blockchain: BLOCKCHAIN_NAME.ETHEREUM,
      address: '0xc5228008c89dfb03937ff5ff9124f0d7bd2028f9',
      name: 'Rubic',
      symbol: 'RBC',
      decimals: 18,

      minAmount: 200,
      maxAmount: 100000
    },
    [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: {
      blockchain: BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN,
      address: '0xd51bd30a91f88dcf72acd45c8a1e7ae0066263e8',
      name: 'Rubic',
      symbol: 'WRBC',
      decimals: 18,

      minAmount: 200,
      maxAmount: 100000
    }
  },

  fromEthFee: 5,
  toEthFee: 100
};

export const BRIDGE_TEST_TOKENS: BridgeTokenPairsByBlockchains[] = [
  {
    fromBlockchain: BLOCKCHAIN_NAME.ETHEREUM,
    toBlockchain: BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN,
    tokenPairs: List([RBC])
  },
  {
    fromBlockchain: BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN,
    toBlockchain: BLOCKCHAIN_NAME.ETHEREUM,
    tokenPairs: List([RBC])
  }
];
