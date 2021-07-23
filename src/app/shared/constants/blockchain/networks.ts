import { NATIVE_TOKEN_ADDRESS } from 'src/app/shared/constants/blockchain/NATIVE_TOKEN_ADDRESS';
import { BLOCKCHAIN_NAME } from '../../models/blockchain/BLOCKCHAIN_NAME';

export default [
  {
    id: 1,
    name: BLOCKCHAIN_NAME.ETHEREUM,
    scannerUrl: 'https://etherscan.io/',
    rpcLink: 'https://damp-misty-hill.quiknode.pro/c5c252ef9e1c07505eaf8109044b87b8e792f54c/',
    imagePath: 'assets/images/icons/coins/eth-contrast.svg',
    nativeCoin: {
      blockchain: BLOCKCHAIN_NAME.ETHEREUM,
      address: NATIVE_TOKEN_ADDRESS,
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18
    }
  },
  {
    id: 56,
    name: BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN,
    scannerUrl: 'https://bscscan.com/',
    rpcLink: 'https://old-spring-bird.bsc.quiknode.pro/4b21f182bb32c5addb6385834400044da34d44f8/',
    imagePath: 'assets/images/icons/coins/bnb.svg',
    nativeCoin: {
      blockchain: BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN,
      address: NATIVE_TOKEN_ADDRESS,
      name: 'Binance Coin',
      symbol: 'BNB',
      decimals: 18
    }
  },
  {
    id: 137,
    name: BLOCKCHAIN_NAME.POLYGON,
    scannerUrl: 'https://polygonscan.com',
    rpcLink: 'https://polygon-mainnet.infura.io/v3/ecf1e6d0427b458b89760012a8500abf',
    imagePath: 'assets/images/icons/coins/polygon.svg',
    nativeCoin: {
      blockchain: BLOCKCHAIN_NAME.POLYGON,
      address: NATIVE_TOKEN_ADDRESS,
      name: 'Matic Network',
      symbol: 'MATIC',
      decimals: 18
    }
  },
  {
    id: 100,
    name: BLOCKCHAIN_NAME.XDAI,
    scannerUrl: 'https://blockscout.com/xdai/mainnet',
    rpcLink: 'https://rpc.xdaichain.com/',
    imagePath: 'assets/images/icons/coins/xdai.svg',
    nativeCoin: {
      blockchain: BLOCKCHAIN_NAME.XDAI,
      address: NATIVE_TOKEN_ADDRESS,
      name: 'xDai',
      symbol: 'XDAI',
      decimals: 18
    }
  },
  {
    id: NaN,
    name: BLOCKCHAIN_NAME.TRON,
    scannerUrl: '',
    rpcLink: '',
    imagePath: 'assets/images/icons/coins/tron.svg',
    nativeCoin: {
      blockchain: BLOCKCHAIN_NAME.TRON,
      address: NATIVE_TOKEN_ADDRESS,
      name: 'Tron',
      symbol: 'TRON',
      decimals: 18
    }
  },
  // Testnets
  {
    id: 42,
    name: BLOCKCHAIN_NAME.ETHEREUM_TESTNET,
    scannerUrl: 'https://kovan.etherscan.io/',
    rpcLink: 'https://kovan.infura.io/v3/ecf1e6d0427b458b89760012a8500abf',
    imagePath: 'assets/images/icons/coins/kovan.png',
    nativeCoin: {
      blockchain: BLOCKCHAIN_NAME.ETHEREUM_TESTNET,
      address: NATIVE_TOKEN_ADDRESS,
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18
    }
  },
  {
    id: 97,
    name: BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN_TESTNET,
    scannerUrl: 'https://testnet.bscscan.com/',
    rpcLink: 'https://data-seed-prebsc-1-s1.binance.org:8545',
    imagePath: 'assets/images/icons/coins/bnb.svg',
    nativeCoin: {
      blockchain: BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN_TESTNET,
      address: NATIVE_TOKEN_ADDRESS,
      name: 'Binance Coin',
      symbol: 'BNB',
      decimals: 18
    }
  },
  {
    id: 80001,
    name: BLOCKCHAIN_NAME.POLYGON_TESTNET,
    scannerUrl: 'https://explorer-mumbai.maticvigil.com/',
    rpcLink: 'https://rpc-mumbai.maticvigil.com',
    imagePath: 'assets/images/icons/coins/polygon.svg',
    nativeCoin: {
      blockchain: BLOCKCHAIN_NAME.POLYGON_TESTNET,
      address: NATIVE_TOKEN_ADDRESS,
      name: 'Polygon',
      symbol: 'MATIC',
      decimals: 18
    }
  }
];
