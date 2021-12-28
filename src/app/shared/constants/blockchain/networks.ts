import { NativeTokenAddress } from '@shared/constants/blockchain/native-token-address';
import { BLOCKCHAIN_NAME } from '@shared/models/blockchain/blockchain-name';

interface NativeCoin {
  blockchain: BLOCKCHAIN_NAME;
  address: string;
  name: string;
  symbol: string;
  decimals: number;
}

interface Network {
  id: number;
  name: BLOCKCHAIN_NAME;
  label: string;
  scannerUrl: string;
  rpcLink: string;
  additionalRpcLink: string;
  imagePath: string;
  nativeCoin: NativeCoin;
}

export default [
  {
    id: 1,
    name: BLOCKCHAIN_NAME.ETHEREUM,
    label: 'Ethereum',
    scannerUrl: 'https://etherscan.io/',
    rpcLink: 'https://empty-broken-firefly.quiknode.pro/55b63ded29c6e56f01da6c1fa29babd3be2ee1c8/',
    additionalRpcLink:
      'https://eth.getblock.io/mainnet/?api_key=02530958-c8c4-4297-974c-66203e79800d',
    imagePath: 'assets/images/icons/coins/eth-contrast.svg',
    nativeCoin: {
      blockchain: BLOCKCHAIN_NAME.ETHEREUM,
      address: NativeTokenAddress,
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18
    }
  },
  {
    id: 56,
    name: BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN,
    label: 'Binance Smart Chain',
    scannerUrl: 'https://bscscan.com/',
    rpcLink: 'https://summer-late-dew.bsc.quiknode.pro/',
    additionalRpcLink:
      'https://bsc.getblock.io/mainnet/?api_key=02530958-c8c4-4297-974c-66203e79800d',
    imagePath: 'assets/images/icons/coins/bnb.svg',
    nativeCoin: {
      blockchain: BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN,
      address: NativeTokenAddress,
      name: 'Binance Coin',
      symbol: 'BNB',
      decimals: 18
    }
  },
  {
    id: 137,
    name: BLOCKCHAIN_NAME.POLYGON,
    label: 'Polygon',
    scannerUrl: 'https://polygonscan.com',
    rpcLink: 'https://polygon-mainnet.infura.io/v3/ecf1e6d0427b458b89760012a8500abf',
    additionalRpcLink:
      'https://matic.getblock.io/mainnet/?api_key=02530958-c8c4-4297-974c-66203e79800d',
    imagePath: 'assets/images/icons/coins/polygon.svg',
    nativeCoin: {
      blockchain: BLOCKCHAIN_NAME.POLYGON,
      address: NativeTokenAddress,
      name: 'Matic Network',
      symbol: 'MATIC',
      decimals: 18
    }
  },
  {
    id: 100,
    name: BLOCKCHAIN_NAME.XDAI,
    label: 'XDai',
    scannerUrl: 'https://blockscout.com/xdai/mainnet',
    rpcLink: 'https://rpc.xdaichain.com/',
    additionalRpcLink: '',
    imagePath: 'assets/images/icons/coins/xdai.svg',
    nativeCoin: {
      blockchain: BLOCKCHAIN_NAME.XDAI,
      address: NativeTokenAddress,
      name: 'xDai',
      symbol: 'XDAI',
      decimals: 18
    }
  },
  {
    id: 1666600000,
    name: BLOCKCHAIN_NAME.HARMONY,
    scannerUrl: 'https://explorer.harmony.one/#/',
    rpcLink: 'https://api.harmony.one',
    additionalRpcLink: 'https://api.s0.t.hmny.io/',
    imagePath: 'assets/images/icons/coins/harmony.svg',
    nativeCoin: {
      blockchain: BLOCKCHAIN_NAME.HARMONY,
      address: NativeTokenAddress,
      name: 'ONE',
      symbol: 'ONE',
      decimals: 18
    }
  },
  {
    id: 43114,
    name: BLOCKCHAIN_NAME.AVALANCHE,
    label: 'Avalanche',
    scannerUrl: 'https://snowtrace.io/',
    rpcLink: 'https://speedy-nodes-nyc.moralis.io/7625ae299d1e13d495412740/avalanche/mainnet',
    additionalRpcLink: '',
    imagePath: 'assets/images/icons/coins/avalanche.svg',
    nativeCoin: {
      blockchain: BLOCKCHAIN_NAME.AVALANCHE,
      address: NativeTokenAddress,
      name: 'AVAX',
      symbol: 'AVAX',
      decimals: 18
    }
  },
  {
    id: 1285,
    name: BLOCKCHAIN_NAME.MOONRIVER,
    label: 'Moonriver',
    scannerUrl: 'https://blockscout.moonriver.moonbeam.network/',
    rpcLink: 'https://rpc.moonriver.moonbeam.network',
    additionalRpcLink: '',
    imagePath: 'assets/images/icons/coins/moonriver.webp',
    nativeCoin: {
      blockchain: BLOCKCHAIN_NAME.MOONRIVER,
      address: NativeTokenAddress,
      name: 'MOVR',
      symbol: 'MOVR',
      decimals: 18
    }
  },
  {
    id: 250,
    name: BLOCKCHAIN_NAME.FANTOM,
    label: 'Fantom',
    scannerUrl: 'https://ftmscan.com',
    rpcLink: 'https://speedy-nodes-nyc.moralis.io/106bebf40377b2e543f51299/fantom/mainnet',
    additionalRpcLink: '',
    imagePath: 'assets/images/icons/coins/fantom.svg',
    nativeCoin: {
      blockchain: BLOCKCHAIN_NAME.FANTOM,
      address: NativeTokenAddress,
      name: 'FTM',
      symbol: 'FTM',
      decimals: 18
    }
  },
  // Testnets
  {
    id: 42,
    name: BLOCKCHAIN_NAME.ETHEREUM_TESTNET,
    label: 'Ethereum',
    scannerUrl: 'https://kovan.etherscan.io/',
    rpcLink: 'https://kovan.infura.io/v3/ecf1e6d0427b458b89760012a8500abf',
    additionalRpcLink: '',
    imagePath: 'assets/images/icons/coins/kovan.png',
    nativeCoin: {
      blockchain: BLOCKCHAIN_NAME.ETHEREUM_TESTNET,
      address: NativeTokenAddress,
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18
    }
  },
  {
    id: 97,
    name: BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN_TESTNET,
    label: 'Binance Smart Chain',
    scannerUrl: 'https://testnet.bscscan.com/',
    rpcLink: 'https://data-seed-prebsc-1-s1.binance.org:8545',
    additionalRpcLink: '',
    imagePath: 'assets/images/icons/coins/bnb.svg',
    nativeCoin: {
      blockchain: BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN_TESTNET,
      address: NativeTokenAddress,
      name: 'Binance Coin',
      symbol: 'BNB',
      decimals: 18
    }
  },
  {
    id: 80001,
    name: BLOCKCHAIN_NAME.POLYGON_TESTNET,
    label: 'Polygon',
    scannerUrl: 'https://explorer-mumbai.maticvigil.com/',
    rpcLink: 'https://rpc-mumbai.maticvigil.com',
    additionalRpcLink: '',
    imagePath: 'assets/images/icons/coins/polygon.svg',
    nativeCoin: {
      blockchain: BLOCKCHAIN_NAME.POLYGON_TESTNET,
      address: NativeTokenAddress,
      name: 'Polygon',
      symbol: 'MATIC',
      decimals: 18
    }
  },
  {
    id: 1666700000,
    name: BLOCKCHAIN_NAME.HARMONY_TESTNET,
    label: 'Harmony',
    scannerUrl: 'https://explorer.pops.one/',
    rpcLink: 'https://api.s0.b.hmny.io',
    additionalRpcLink: '',
    imagePath: 'assets/images/icons/coins/harmony.svg',
    nativeCoin: {
      blockchain: BLOCKCHAIN_NAME.HARMONY_TESTNET,
      address: NativeTokenAddress,
      name: 'ONE',
      symbol: 'ONE',
      decimals: 18
    }
  },
  {
    id: 43113,
    name: BLOCKCHAIN_NAME.AVALANCHE_TESTNET,
    label: 'Avalanche testnet',
    scannerUrl: 'https://cchain.explorer.avax-test.network',
    rpcLink: 'https://api.avax-test.network/ext/bc/C/rpc',
    additionalRpcLink: '',
    imagePath: 'assets/images/icons/coins/avalanche-testnet.svg',
    nativeCoin: {
      blockchain: BLOCKCHAIN_NAME.AVALANCHE_TESTNET,
      address: NativeTokenAddress,
      name: 'AVAX',
      symbol: 'AVAX',
      decimals: 18
    }
  },
  {
    id: NaN,
    name: BLOCKCHAIN_NAME.SOLANA,
    label: 'Solana',
    scannerUrl: 'https://explorer.solana.com',
    rpcLink: 'https:/https://api.mainnet-beta.solana.com',
    additionalRpcLink: '',
    imagePath: 'assets/images/icons/coins/solana.svg',
    nativeCoin: {
      blockchain: BLOCKCHAIN_NAME.SOLANA,
      address: 'SOLANA_NATIVE_TOKEN_ADDRESS',
      name: 'SOL',
      symbol: 'SOL',
      decimals: 9
    }
  }
] as ReadonlyArray<Network>;
