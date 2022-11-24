import { BLOCKCHAIN_NAME, EvmBlockchainName } from 'rubic-sdk';

interface DefaultBlockchainData {
  name: string;
  rpc: string;
}

export const defaultBlockchainData: Partial<Record<EvmBlockchainName, DefaultBlockchainData>> = {
  [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: {
    name: 'Binance Smart Chain Mainnet',
    rpc: 'https://bsc-dataseed1.binance.org'
  },
  [BLOCKCHAIN_NAME.POLYGON]: {
    name: 'Polygon Mainnet',
    rpc: 'https://rpc-mainnet.maticvigil.com'
  },
  [BLOCKCHAIN_NAME.HARMONY]: {
    name: 'Harmony Mainnet Shard 0',
    rpc: 'https://api.harmony.one'
  },
  [BLOCKCHAIN_NAME.AVALANCHE]: {
    name: 'Avalanche Mainnet',
    rpc: 'https://api.avax.network/ext/bc/C/rpc'
  },
  [BLOCKCHAIN_NAME.MOONRIVER]: {
    name: 'Moonriver',
    rpc: 'https://rpc.moonriver.moonbeam.network'
  },
  [BLOCKCHAIN_NAME.FANTOM]: {
    name: 'Fantom Opera',
    rpc: 'https://rpc.ankr.com/fantom'
  },
  [BLOCKCHAIN_NAME.ARBITRUM]: {
    name: 'Arbitrum One',
    rpc: 'https://arb1.arbitrum.io/rpc'
  },
  [BLOCKCHAIN_NAME.AURORA]: {
    name: 'Aurora MainNet',
    rpc: 'https://mainnet.aurora.dev'
  },
  [BLOCKCHAIN_NAME.TELOS]: {
    name: 'Telos EVM Mainnet',
    rpc: 'https://mainnet.telos.net/evm'
  },
  [BLOCKCHAIN_NAME.OPTIMISM]: {
    name: 'Optimism',
    rpc: 'https://mainnet.optimism.io'
  },
  [BLOCKCHAIN_NAME.CRONOS]: {
    name: 'Cronos Mainnet Beta',
    rpc: 'https://evm.cronos.org'
  },
  [BLOCKCHAIN_NAME.OKE_X_CHAIN]: {
    name: 'OKXChain Mainnet',
    rpc: 'https://exchainrpc.okex.org'
  },
  [BLOCKCHAIN_NAME.GNOSIS]: {
    name: 'Gnosis Chain',
    rpc: 'https://rpc.gnosischain.com'
  },
  [BLOCKCHAIN_NAME.FUSE]: {
    name: 'Fuse Mainnet',
    rpc: 'https://rpc.fuse.io'
  },
  [BLOCKCHAIN_NAME.MOONBEAM]: {
    name: 'Moonbeam',
    rpc: 'https://rpc.api.moonbeam.network'
  },
  [BLOCKCHAIN_NAME.CELO]: {
    name: 'Celo Mainnet',
    rpc: 'https://forno.celo.org'
  },
  [BLOCKCHAIN_NAME.KAVA]: {
    name: 'Kava EVM',
    rpc: 'https://evm.kava.io'
  },
  [BLOCKCHAIN_NAME.BITGERT]: {
    name: 'Bitgert',
    rpc: 'https://serverrpc.com'
  },
  [BLOCKCHAIN_NAME.OASIS]: {
    name: 'Oasis',
    rpc: 'https://emerald.oasis.dev'
  },
  [BLOCKCHAIN_NAME.METIS]: {
    name: 'Metis',
    rpc: 'https://andromeda.metis.io/?owner=1088'
  },
  [BLOCKCHAIN_NAME.DFK]: {
    name: 'DeFi Kingdoms',
    rpc: 'https://subnets.avax.network/defi-kingdoms/dfk-chain/rpc'
  },
  [BLOCKCHAIN_NAME.KLAYTN]: {
    name: 'Klaytn',
    rpc: 'https://rpc.ankr.com/klaytn/a8bbc9d3f69cf00657231179b7006f784b86dd0eb67aec90116347d32c10867d'
  },
  [BLOCKCHAIN_NAME.VELAS]: {
    name: 'Velas',
    rpc: 'https://evmexplorer.velas.com/rpc'
  },
  [BLOCKCHAIN_NAME.SYSCOIN]: {
    name: 'Syscoin',
    rpc: 'https://rpc.syscoin.org'
  }
};
