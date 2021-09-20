import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import ERC20_ABI from './erc-20-abi';

export const HEALTHCHECK = {
  [BLOCKCHAIN_NAME.ETHEREUM]: {
    contractAddress: '0xdac17f958d2ee523a2206206994597c13d831ec7',
    contractAbi: ERC20_ABI,
    method: 'symbol',
    expected: 'USDT'
  },
  [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: {
    contractAddress: '0xe9e7cea3dedca5984780bafc599bd69add087d56',
    contractAbi: ERC20_ABI,
    method: 'symbol',
    expected: 'BUSD'
  },
  [BLOCKCHAIN_NAME.POLYGON]: {
    contractAddress: '0x7FFB3d637014488b63fb9858E279385685AFc1e2',
    contractAbi: ERC20_ABI,
    method: 'symbol',
    expected: 'USDT'
  },
  [BLOCKCHAIN_NAME.HARMONY]: {
    contractAddress: '0x3c2b8be99c50593081eaa2a724f0b8285f5aba8f',
    contractAbi: ERC20_ABI,
    method: 'symbol',
    expected: '1USDT'
  }
};
