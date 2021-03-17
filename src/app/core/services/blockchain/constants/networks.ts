import { BLOCKCHAIN_NAME } from '../../../../shared/models/blockchain/BLOCKCHAIN_NAME';

export default [
  {
    id: 1,
    name: BLOCKCHAIN_NAME.ETHEREUM,
    rpcLink: 'https://mainnet.infura.io/v3/ecf1e6d0427b458b89760012a8500abf',
    nativeCoin: {
      blockchainName: BLOCKCHAIN_NAME.ETHEREUM,
      address: '0x0000000000000000000000000000000000000000',
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18
    }
  },
  {
    id: 56,
    name: BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN,
    rpcLink: 'https://bsc-dataseed1.binance.org',
    nativeCoin: {
      blockchainName: BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN,
      address: '0x0000000000000000000000000000000000000000',
      name: 'Binance Coin',
      symbol: 'BNB',
      decimals: 18
    }
  },
  {
    id: 137,
    name: BLOCKCHAIN_NAME.MATIC,
    rpcLink: 'https://rpc-mainnet.matic.network',
    nativeCoin: {
      blockchainName: BLOCKCHAIN_NAME.MATIC,
      address: '0x0000000000000000000000000000000000000000',
      name: 'Polygon',
      symbol: 'MATIC',
      decimals: 18
    }
  },
  // Testnets
  {
    id: 42,
    name: BLOCKCHAIN_NAME.ETHEREUM_TESTNET,
    rpcLink: 'https://kovan.infura.io/v3/ecf1e6d0427b458b89760012a8500abf',
    nativeCoin: {
      blockchainName: BLOCKCHAIN_NAME.ETHEREUM_TESTNET,
      address: '0x0000000000000000000000000000000000000000',
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18
    }
  }
];
