import {
  NATIVE_NEAR_ADDRESS,
  NATIVE_SOLANA_MINT_ADDRESS,
  NATIVE_TOKEN_ADDRESS
} from '@shared/constants/blockchain/native-token-address';
import { BLOCKCHAIN_NAME, BlockchainName } from '@shared/models/blockchain/blockchain-name';

interface NativeCoin {
  blockchain: BlockchainName;
  address: string;
  name: string;
  symbol: string;
  decimals: number;
}

export interface Network<T = BlockchainName> {
  id: number;
  name: T;
  label: string;
  scannerUrl: string;
  rpcLink: string;
  additionalRpcLink: string;
  imagePath: string;
  nativeCoin: NativeCoin;
}

const networks: ReadonlyArray<Network> = [
  {
    id: 1,
    name: BLOCKCHAIN_NAME.ETHEREUM,
    label: 'Ethereum',
    scannerUrl: 'https://etherscan.io/',
    rpcLink:
      'https://rpc.ankr.com/eth/a8bbc9d3f69cf00657231179b7006f784b86dd0eb67aec90116347d32c10867d',
    additionalRpcLink:
      'https://eth.getblock.io/mainnet/?api_key=02530958-c8c4-4297-974c-66203e79800d',
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
    label: 'BSC',
    scannerUrl: 'https://bscscan.com/',
    rpcLink:
      'https://rpc.ankr.com/bsc/a8bbc9d3f69cf00657231179b7006f784b86dd0eb67aec90116347d32c10867d',
    additionalRpcLink:
      'https://bsc.getblock.io/mainnet/?api_key=02530958-c8c4-4297-974c-66203e79800d',
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
    label: 'Polygon',
    scannerUrl: 'https://polygonscan.com',
    rpcLink:
      'https://rpc.ankr.com/polygon/a8bbc9d3f69cf00657231179b7006f784b86dd0eb67aec90116347d32c10867d',
    additionalRpcLink:
      'https://matic.getblock.io/mainnet/?api_key=02530958-c8c4-4297-974c-66203e79800d',
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
    id: 1666600000,
    name: BLOCKCHAIN_NAME.HARMONY,
    label: 'HARMONY',
    scannerUrl: 'https://explorer.harmony.one/#/',
    rpcLink: 'https://api.harmony.one',
    additionalRpcLink: 'https://api.s0.t.hmny.io/',
    imagePath: 'assets/images/icons/coins/harmony.svg',
    nativeCoin: {
      blockchain: BLOCKCHAIN_NAME.HARMONY,
      address: NATIVE_TOKEN_ADDRESS,
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
    rpcLink:
      'https://rpc.ankr.com/avalanche/a8bbc9d3f69cf00657231179b7006f784b86dd0eb67aec90116347d32c10867d',
    additionalRpcLink:
      'https://speedy-nodes-nyc.moralis.io/7625ae299d1e13d495412740/avalanche/mainnet',
    imagePath: 'assets/images/icons/coins/avalanche.svg',
    nativeCoin: {
      blockchain: BLOCKCHAIN_NAME.AVALANCHE,
      address: NATIVE_TOKEN_ADDRESS,
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
    rpcLink: 'https://moonriver-api.bwarelabs.com/e72ceb4c-1e99-4e9f-8f3c-83f0152ad69f',
    additionalRpcLink: 'https://rpc.moonriver.moonbeam.network',
    imagePath: 'assets/images/icons/coins/moonriver.webp',
    nativeCoin: {
      blockchain: BLOCKCHAIN_NAME.MOONRIVER,
      address: NATIVE_TOKEN_ADDRESS,
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
    additionalRpcLink:
      'https://ftm.getblock.io/mainnet/?api_key=02530958-c8c4-4297-974c-66203e79800d',
    imagePath: 'assets/images/icons/coins/fantom.svg',
    nativeCoin: {
      blockchain: BLOCKCHAIN_NAME.FANTOM,
      address: NATIVE_TOKEN_ADDRESS,
      name: 'FTM',
      symbol: 'FTM',
      decimals: 18
    }
  },
  {
    id: 42161,
    name: BLOCKCHAIN_NAME.ARBITRUM,
    label: 'Arbitrum One',
    scannerUrl: 'https://arbiscan.io',
    rpcLink:
      'https://late-white-sky.arbitrum-mainnet.quiknode.pro/84da6c33a092bf64d9d72bc52c5db62aac00c81c/',
    additionalRpcLink: 'https://arb1.arbitrum.io/rpc',
    imagePath: 'assets/images/icons/coins/arbitrum.svg',
    nativeCoin: {
      blockchain: BLOCKCHAIN_NAME.ARBITRUM,
      address: NATIVE_TOKEN_ADDRESS,
      name: 'AETH',
      symbol: 'AETH',
      decimals: 18
    }
  },
  {
    id: 1313161554,
    name: BLOCKCHAIN_NAME.AURORA,
    label: 'Aurora',
    scannerUrl: 'https://explorer.mainnet.aurora.dev',
    rpcLink: 'https://mainnet.aurora.dev',
    additionalRpcLink: '',
    imagePath: 'assets/images/icons/coins/aurora.svg',
    nativeCoin: {
      blockchain: BLOCKCHAIN_NAME.AURORA,
      address: NATIVE_TOKEN_ADDRESS,
      name: 'aETH',
      symbol: 'aETH',
      decimals: 18
    }
  },
  {
    id: NaN,
    name: BLOCKCHAIN_NAME.SOLANA,
    label: 'Solana',
    scannerUrl: 'https://explorer.solana.com',
    rpcLink: 'https://green-hidden-shape.solana-mainnet.quiknode.pro/',
    additionalRpcLink:
      'https://sol.getblock.io/mainnet/?api_key=02530958-c8c4-4297-974c-66203e79800d',
    imagePath: 'assets/images/icons/coins/solana.svg',
    nativeCoin: {
      blockchain: BLOCKCHAIN_NAME.SOLANA,
      address: NATIVE_SOLANA_MINT_ADDRESS,
      name: 'SOL',
      symbol: 'SOL',
      decimals: 9
    }
  },
  {
    id: NaN,
    name: BLOCKCHAIN_NAME.NEAR,
    label: 'Near',
    scannerUrl: 'https://explorer.near.org/',
    rpcLink: 'https://rpc.testnet.near.org',
    additionalRpcLink: '',
    imagePath: 'assets/images/icons/coins/near.svg',
    nativeCoin: {
      blockchain: BLOCKCHAIN_NAME.NEAR,
      address: NATIVE_NEAR_ADDRESS,
      name: 'NEAR',
      symbol: 'NEAR',
      decimals: 24
    }
  },
  {
    id: 40,
    name: BLOCKCHAIN_NAME.TELOS,
    label: 'Telos EVM',
    scannerUrl: 'https://teloscan.io',
    rpcLink: 'https://rpc1.eu.telos.net/evm',
    additionalRpcLink: 'https://mainnet.telos.net/evm',
    imagePath: 'assets/images/icons/coins/telos.svg',
    nativeCoin: {
      blockchain: BLOCKCHAIN_NAME.TELOS,
      address: NATIVE_TOKEN_ADDRESS,
      name: 'Telos EVM',
      symbol: 'TLOS',
      decimals: 18
    }
  }
];

export default networks;
