import {
  NATIVE_NEAR_ADDRESS,
  NATIVE_SOLANA_MINT_ADDRESS,
  NATIVE_TOKEN_ADDRESS
} from '@shared/constants/blockchain/native-token-address';
import { BlockchainName, BLOCKCHAIN_NAME } from 'rubic-sdk';

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
  rpcList: unknown[];
  imagePath: string;
  nativeCoin: NativeCoin;
}

const networks: ReadonlyArray<Network> = [
  {
    id: 1,
    name: BLOCKCHAIN_NAME.ETHEREUM,
    label: 'Ethereum',
    scannerUrl: 'https://etherscan.io/',
    rpcList: [
      'https://rpc.ankr.com/eth/a8bbc9d3f69cf00657231179b7006f784b86dd0eb67aec90116347d32c10867d',
      'https://eth.getblock.io/mainnet/?api_key=02530958-c8c4-4297-974c-66203e79800d'
    ],
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
    rpcList: [
      'https://rpc.ankr.com/bsc/a8bbc9d3f69cf00657231179b7006f784b86dd0eb67aec90116347d32c10867d',
      'https://bsc.getblock.io/mainnet/?api_key=02530958-c8c4-4297-974c-66203e79800d'
    ],
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
    rpcList: [
      'https://rpc.ankr.com/polygon/a8bbc9d3f69cf00657231179b7006f784b86dd0eb67aec90116347d32c10867d',
      'https://matic.getblock.io/mainnet/?api_key=02530958-c8c4-4297-974c-66203e79800d'
    ],
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
    label: 'Harmony',
    scannerUrl: 'https://explorer.harmony.one/#/',
    rpcList: ['https://api.harmony.one', 'https://api.s0.t.hmny.io/'],
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
    rpcList: [
      'https://rpc.ankr.com/avalanche/a8bbc9d3f69cf00657231179b7006f784b86dd0eb67aec90116347d32c10867d',
      'https://avax.getblock.io/mainnet/ext/bc/C/rpc?api_key=02530958-c8c4-4297-974c-66203e79800d',
      'https://speedy-nodes-nyc.moralis.io/7625ae299d1e13d495412740/avalanche/mainnet'
    ],
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
    rpcList: [
      'https://moonriver-api.bwarelabs.com/e72ceb4c-1e99-4e9f-8f3c-83f0152ad69f',
      'https://rpc.moonriver.moonbeam.network'
    ],
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
    rpcList: [
      'https://rpc.ankr.com/fantom/a8bbc9d3f69cf00657231179b7006f784b86dd0eb67aec90116347d32c10867d',
      'https://speedy-nodes-nyc.moralis.io/106bebf40377b2e543f51299/fantom/mainnet'
    ],
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
    label: 'Arbitrum',
    scannerUrl: 'https://arbiscan.io',
    rpcList: [
      'https://late-white-sky.arbitrum-mainnet.quiknode.pro/84da6c33a092bf64d9d72bc52c5db62aac00c81c/',
      'https://arb1.arbitrum.io/rpc'
    ],
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
    rpcList: ['https://mainnet.aurora.dev'],
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
    rpcList: [
      'https://green-hidden-shape.solana-mainnet.quiknode.pro/',
      'https://sol.getblock.io/mainnet/?api_key=02530958-c8c4-4297-974c-66203e79800d'
    ],
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
    rpcList: ['https://rpc.testnet.near.org'],
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
    rpcList: ['https://rpc1.eu.telos.net/evm', 'https://mainnet.telos.net/evm'],
    imagePath: 'assets/images/icons/coins/telos.svg',
    nativeCoin: {
      blockchain: BLOCKCHAIN_NAME.TELOS,
      address: NATIVE_TOKEN_ADDRESS,
      name: 'Telos EVM',
      symbol: 'TLOS',
      decimals: 18
    }
  },
  {
    id: 10,
    name: BLOCKCHAIN_NAME.OPTIMISM,
    label: 'Optimism',
    scannerUrl: 'https://optimistic.etherscan.io',
    rpcList: [
      'https://rpc.ankr.com/optimism/a8bbc9d3f69cf00657231179b7006f784b86dd0eb67aec90116347d32c10867d'
    ],
    imagePath: 'assets/images/icons/coins/optimism.png',
    nativeCoin: {
      blockchain: BLOCKCHAIN_NAME.OPTIMISM,
      address: NATIVE_TOKEN_ADDRESS,
      name: 'ETH',
      symbol: 'ETH',
      decimals: 18
    }
  },
  {
    id: 25,
    name: BLOCKCHAIN_NAME.CRONOS,
    label: 'Cronos',
    scannerUrl: 'https://cronoscan.com',
    rpcList: ['https://evm-cronos.crypto.org'],
    imagePath: 'assets/images/icons/coins/cronos.png',
    nativeCoin: {
      blockchain: BLOCKCHAIN_NAME.CRONOS,
      address: NATIVE_TOKEN_ADDRESS,
      name: 'CRO',
      symbol: 'CRO',
      decimals: 18
    }
  },
  {
    id: 66,
    name: BLOCKCHAIN_NAME.OKE_X_CHAIN,
    label: 'OKXChain',
    scannerUrl: 'https://www.oklink.com/en/okc',
    rpcList: ['https://exchainrpc.okex.org'],
    imagePath: 'assets/images/icons/coins/okexchain.png',
    nativeCoin: {
      blockchain: BLOCKCHAIN_NAME.OKE_X_CHAIN,
      address: NATIVE_TOKEN_ADDRESS,
      name: 'OKT',
      symbol: 'OKT',
      decimals: 18
    }
  },
  {
    id: 100,
    name: BLOCKCHAIN_NAME.GNOSIS,
    label: 'Gnosis',
    scannerUrl: 'https://blockscout.com/xdai/mainnet',
    rpcList: [
      'https://rpc.ankr.com/gnosis/a8bbc9d3f69cf00657231179b7006f784b86dd0eb67aec90116347d32c10867d'
    ],
    imagePath: 'assets/images/icons/coins/gnosis.png',
    nativeCoin: {
      blockchain: BLOCKCHAIN_NAME.GNOSIS,
      address: NATIVE_TOKEN_ADDRESS,
      name: 'xDAI',
      symbol: 'xDAI',
      decimals: 18
    }
  },
  {
    id: 122,
    name: BLOCKCHAIN_NAME.FUSE,
    label: 'Fuse',
    scannerUrl: 'https://explorer.fuse.io',
    rpcList: ['https://fuse-rpc.gateway.pokt.network/'],
    imagePath: 'assets/images/icons/coins/fuse.png',
    nativeCoin: {
      blockchain: BLOCKCHAIN_NAME.FUSE,
      address: NATIVE_TOKEN_ADDRESS,
      name: 'FUSE',
      symbol: 'FUSE',
      decimals: 18
    }
  },
  {
    id: 1284,
    name: BLOCKCHAIN_NAME.MOONBEAM,
    label: 'Moonbeam',
    scannerUrl: 'https://moonscan.io',
    rpcList: [
      'https://rpc.ankr.com/moonbeam/a8bbc9d3f69cf00657231179b7006f784b86dd0eb67aec90116347d32c10867d'
    ],
    imagePath: 'assets/images/icons/coins/moonbeam.png',
    nativeCoin: {
      blockchain: BLOCKCHAIN_NAME.MOONBEAM,
      address: NATIVE_TOKEN_ADDRESS,
      name: 'GLMR',
      symbol: 'GLMR',
      decimals: 18
    }
  },
  {
    id: 42220,
    name: BLOCKCHAIN_NAME.CELO,
    label: 'Celo',
    scannerUrl: 'https://explorer.celo.org',
    rpcList: [
      'https://rpc.ankr.com/celo/a8bbc9d3f69cf00657231179b7006f784b86dd0eb67aec90116347d32c10867d'
    ],
    imagePath: 'assets/images/icons/coins/celo.png',
    nativeCoin: {
      blockchain: BLOCKCHAIN_NAME.CELO,
      address: NATIVE_TOKEN_ADDRESS,
      name: 'CELO',
      symbol: 'CELO',
      decimals: 18
    }
  },
  {
    id: 288,
    name: BLOCKCHAIN_NAME.BOBA,
    label: 'Boba',
    scannerUrl: 'https://bobascan.com/',
    rpcList: ['https://mainnet.boba.network'],
    imagePath: 'assets/images/icons/coins/boba.svg',
    nativeCoin: {
      blockchain: BLOCKCHAIN_NAME.BOBA,
      address: NATIVE_TOKEN_ADDRESS,
      name: 'ETH',
      symbol: 'ETH',
      decimals: 18
    }
  },
  {
    id: 592,
    name: BLOCKCHAIN_NAME.ASTAR,
    label: 'Astar',
    scannerUrl: 'https://astar.subscan.io',
    rpcList: ['https://rpc.astar.network:8545'],
    imagePath: 'assets/images/icons/coins/astar.svg',
    nativeCoin: {
      blockchain: BLOCKCHAIN_NAME.ASTAR,
      address: NATIVE_TOKEN_ADDRESS,
      name: 'ASTR',
      symbol: 'ASTR',
      decimals: 18
    }
  },
  {
    id: 5555,
    name: BLOCKCHAIN_NAME.BITCOIN,
    label: 'Bitcoin',
    scannerUrl: 'https://blockchair.com/bitcoin/',
    rpcList: [],
    imagePath: 'assets/images/icons/coins/bitcoin.svg',
    nativeCoin: {
      blockchain: BLOCKCHAIN_NAME.BITCOIN,
      address: '',
      name: 'Bitcoin',
      symbol: 'BTC',
      decimals: 8
    }
  },
  {
    id: 10001,
    name: BLOCKCHAIN_NAME.ETHEREUM_POW,
    label: 'Eth PoW',
    scannerUrl: 'https://www.oklink.com/en/ethw/',
    rpcList: ['https://mainnet.ethereumpow.org/'],
    imagePath: 'assets/images/icons/coins/eth-pow.png',
    nativeCoin: {
      blockchain: BLOCKCHAIN_NAME.ETHEREUM_POW,
      address: NATIVE_TOKEN_ADDRESS,
      name: 'Ethereum PoW',
      symbol: 'ETHW',
      decimals: 18
    }
  },
  {
    id: 10001,
    name: BLOCKCHAIN_NAME.ETHEREUM_POW,
    label: 'Eth PoW',
    scannerUrl: 'https://www.oklink.com/en/ethw/',
    rpcList: ['https://mainnet.ethereumpow.org/'],
    imagePath: 'assets/images/icons/coins/eth-pow.png',
    nativeCoin: {
      blockchain: BLOCKCHAIN_NAME.ETHEREUM_POW,
      address: NATIVE_TOKEN_ADDRESS,
      name: 'Ethereum PoW',
      symbol: 'ETHW',
      decimals: 18
    }
  },
  {
    id: 195,
    name: BLOCKCHAIN_NAME.TRON,
    label: 'Tron',
    scannerUrl: 'https://tronscan.org/#/',
    rpcList: [
      {
        fullHost: 'https://api.trongrid.io'
      }
    ],
    imagePath: 'assets/images/icons/coins/tron.png',
    nativeCoin: {
      blockchain: BLOCKCHAIN_NAME.TRON,
      address: NATIVE_TOKEN_ADDRESS,
      name: 'TRON',
      symbol: 'TRON',
      decimals: 6
    }
  },
  {
    id: 32520,
    name: BLOCKCHAIN_NAME.BITGERT,
    label: 'Bitgert',
    scannerUrl: 'https://brisescan.com/',
    rpcList: [
      'https://serverrpc.com',
      'https://dedicated.brisescan.com/',
      'https://rpc-bitgert-vefi.com',
      'https://rpc.icecreamswap.com',
      'https://mainnet-rpc.brisescan.com',
      'https://chainrpc.com'
    ],
    imagePath: 'assets/images/icons/coins/bitgert.png',
    nativeCoin: {
      blockchain: BLOCKCHAIN_NAME.BITGERT,
      address: NATIVE_TOKEN_ADDRESS,
      name: 'Brise',
      symbol: 'BRISE',
      decimals: 18
    }
  }
];

export default networks;
