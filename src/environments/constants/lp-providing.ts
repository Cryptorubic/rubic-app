import { PoolToken } from '@app/features/liquidity-providing/models/pool-token.enum';
import { BLOCKCHAIN_NAME } from '@app/shared/models/blockchain/blockchain-name';

export const LP_PROVIDING_CONFIG_PROD = {
  blockchain: BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN,
  contractAddress: '0x36684Be8C3980097Bf193795b94c14FA8569347e',
  minEnterAmount: 1,
  maxEnterAmount: 10,
  poolSize: 90,
  poolTokens: {
    [PoolToken.BRBC]: {
      name: 'Rubic',
      symbol: 'BRBC',
      image: 'assets/images/icons/lp-providing/brbc.svg',
      address: '0x8E3BCC334657560253B83f08331d85267316e08a',
      blockchain: BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN
    },
    [PoolToken.USDC]: {
      name: 'USD coin',
      symbol: 'USDC',
      image: 'assets/images/icons/lp-providing/usdc.svg',
      address: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
      blockchain: BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN,
      decimals: 18
    }
  },
  whitelist: [
    '0x449ab89a9c1dee7822580dad3cb6c0852210793a',
    '0xcc513c5e4f396e68c15282cfa02d3e9c615cd714',
    '0x7c10f3fea375284c2c70dd05eac26e7ffc42242b'
  ]
};

export const LP_PROVIDING_CONFIG_DEVELOP = {
  blockchain: BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN,
  contractAddress: '0xC85A61d178bBdDc7752C6618bA498074cD6FA9f1',
  minEnterAmount: 5,
  maxEnterAmount: 8,
  poolSize: 80,
  maxEnterAmountWhitelist: 8,
  poolTokens: {
    [PoolToken.BRBC]: {
      name: 'Rubic',
      symbol: 'BRBC',
      image: 'assets/images/icons/lp-providing/brbc.svg',
      address: '0x8E3BCC334657560253B83f08331d85267316e08a',
      blockchain: BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN
    },
    [PoolToken.USDC]: {
      name: 'USD coin',
      symbol: 'USDC',
      image: 'assets/images/icons/lp-providing/usdc.svg',
      address: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
      blockchain: BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN
    }
  },
  whitelist: [
    '0x449ab89a9c1dee7822580dad3cb6c0852210793a',
    '0xcc513c5e4f396e68c15282cfa02d3e9c615cd714',
    '0x7c10f3fea375284c2c70dd05eac26e7ffc42242b'
  ]
};
