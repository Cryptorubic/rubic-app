import { BLOCKCHAIN_NAME } from '@shared/models/blockchain/blockchain-name';
import ERC20_ABI from '@core/services/blockchain/constants/erc-20-abi';

export const Healthcheck = {
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
  },
  [BLOCKCHAIN_NAME.AVALANCHE]: {
    contractAddress: '0xc7198437980c041c805A1EDcbA50c1Ce5db95118',
    contractAbi: ERC20_ABI,
    method: 'symbol',
    expected: 'USDT.e'
  },
  [BLOCKCHAIN_NAME.MOONRIVER]: {
    contractAddress: '0xB44a9B6905aF7c801311e8F4E76932ee959c663C',
    contractAbi: ERC20_ABI,
    method: 'symbol',
    expected: 'USDT'
  },
  [BLOCKCHAIN_NAME.FANTOM]: {
    contractAddress: '0x049d68029688eabf473097a2fc38ef61633a3c7a',
    contractAbi: ERC20_ABI,
    method: 'symbol',
    expected: 'fUSDT'
  }
};
