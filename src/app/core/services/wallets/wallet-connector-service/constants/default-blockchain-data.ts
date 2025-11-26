import { BLOCKCHAIN_NAME, EvmBlockchainName } from '@cryptorubic/sdk';

interface DefaultBlockchainData {
  name: string;
  rpc: string;
}

// TODO: remove Partial
export const defaultBlockchainData: Partial<Record<EvmBlockchainName, DefaultBlockchainData>> = {
  [BLOCKCHAIN_NAME.ETHEREUM]: {
    name: 'Ethereum Mainnet',
    rpc: 'https://rpc.ankr.com/eth'
  },
  [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: {
    name: 'Binance Smart Chain Mainnet',
    rpc: 'https://bsc-dataseed1.binance.org'
  },
  [BLOCKCHAIN_NAME.POLYGON]: {
    name: 'Polygon Mainnet',
    rpc: 'https://polygon-rpc.com'
  },
  [BLOCKCHAIN_NAME.POLYGON_ZKEVM]: {
    name: 'Polygon zkEVM',
    rpc: 'https://zkevm-rpc.com'
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
    rpc: 'https://rpc.telos.net'
  },
  [BLOCKCHAIN_NAME.OPTIMISM]: {
    name: 'Optimism',
    rpc: 'https://rpc.ankr.com/optimism'
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
    rpc: 'https://public-en-cypress.klaytn.net/'
  },
  [BLOCKCHAIN_NAME.VELAS]: {
    name: 'Velas',
    rpc: 'https://evmexplorer.velas.com/rpc'
  },
  [BLOCKCHAIN_NAME.SYSCOIN]: {
    name: 'Syscoin',
    rpc: 'https://rpc.syscoin.org'
  },
  [BLOCKCHAIN_NAME.ASTAR_EVM]: {
    name: 'Astar EVM',
    rpc: 'https://evm.astar.network/'
  },
  [BLOCKCHAIN_NAME.PULSECHAIN]: {
    name: 'Pulsechain',
    rpc: 'https://rpc.pulsechain.com'
  },
  [BLOCKCHAIN_NAME.LINEA]: {
    name: 'Linea',
    rpc: 'https://linea-mainnet.infura.io/v3'
  },
  [BLOCKCHAIN_NAME.BASE]: {
    name: 'Base',
    rpc: 'https://mainnet.base.org'
  },
  [BLOCKCHAIN_NAME.MANTLE]: {
    name: 'Mantle',
    rpc: 'https://mantle.publicnode.com'
  },
  [BLOCKCHAIN_NAME.ZK_SYNC]: {
    name: 'zkSync Era',
    rpc: 'https://mainnet.era.zksync.io'
  },
  [BLOCKCHAIN_NAME.MANTA_PACIFIC]: {
    name: 'Manta Pacific',
    rpc: 'https://pacific-rpc.manta.network/http'
  },
  [BLOCKCHAIN_NAME.SCROLL]: {
    name: 'Scroll',
    rpc: 'https://rpc.scroll.io/'
  },
  [BLOCKCHAIN_NAME.ZETACHAIN]: {
    name: 'Zetachain',
    rpc: 'https://zetachain-evm.blockpi.network/v1/rpc/public'
  },
  [BLOCKCHAIN_NAME.BLAST]: {
    name: 'Blast',
    rpc: 'https://rpc.ankr.com/blast'
  },
  [BLOCKCHAIN_NAME.BLAST_TESTNET]: {
    name: 'Blast Testnet',
    rpc: 'https://sepolia.blast.io'
  },
  [BLOCKCHAIN_NAME.HORIZEN_EON]: {
    name: 'Horizen EON',
    rpc: 'https://eon-rpc.horizenlabs.io/ethv1'
  },
  [BLOCKCHAIN_NAME.MERLIN]: {
    name: 'Merlin',
    rpc: 'https://rpc.merlinchain.io'
  },
  [BLOCKCHAIN_NAME.ROOTSTOCK]: {
    name: 'Rootstock',
    rpc: 'https://public-node.rsk.co'
  },
  [BLOCKCHAIN_NAME.MODE]: {
    name: 'Mode',
    rpc: 'https://mainnet.mode.network'
  },
  [BLOCKCHAIN_NAME.ZK_FAIR]: {
    name: 'zkFair',
    rpc: 'https://rpc.zkfair.io'
  },
  [BLOCKCHAIN_NAME.ZK_LINK]: {
    name: 'zkLink',
    rpc: 'https://rpc.zklink.io'
  },
  [BLOCKCHAIN_NAME.XLAYER]: {
    name: 'X Layer',
    rpc: 'https://rpc.xlayer.tech'
  },
  [BLOCKCHAIN_NAME.TAIKO]: {
    name: 'Taiko',
    rpc: 'https://rpc.mainnet.taiko.xyz'
  },
  [BLOCKCHAIN_NAME.SEI]: {
    name: 'Sei',
    rpc: 'https://evm-rpc.sei-apis.com'
  },
  [BLOCKCHAIN_NAME.CORE]: {
    name: 'CORE',
    rpc: 'https://rpc.coredao.org'
  },
  [BLOCKCHAIN_NAME.BAHAMUT]: {
    name: 'Bahamut',
    rpc: 'https://rpc1.bahamut.io'
  },
  [BLOCKCHAIN_NAME.HOLESKY]: {
    name: 'Holesky',
    rpc: 'https://ethereum-holesky-rpc.publicnode.com'
  },
  [BLOCKCHAIN_NAME.FLARE]: {
    name: 'Flare',
    rpc: 'https://flare-api.flare.network/ext/C/rpc'
  },
  // [BLOCKCHAIN_NAME.BITCOIN_CASH]: {
  //   name: 'Bitcoin Cash',
  //   rpc: 'https://smartbch.greyh.at'
  // },
  [BLOCKCHAIN_NAME.IOTEX]: {
    name: 'Iotex',
    rpc: 'https://rpc.ankr.com/iotex'
  },
  [BLOCKCHAIN_NAME.BITLAYER]: {
    name: 'Bitlayer',
    rpc: 'https://rpc.ankr.com/bitlayer'
  },
  [BLOCKCHAIN_NAME.GRAVITY]: {
    name: 'Gravity',
    rpc: 'https://rpc.gravity.xyz'
  },
  // [BLOCKCHAIN_NAME.SONIC]: {
  //   name: 'Sonic',
  //   rpc: 'https://rpc.soniclabs.com'
  // },
  [BLOCKCHAIN_NAME.MORPH]: {
    name: 'Morph',
    rpc: 'https://rpc-quicknode.morphl2.io'
  },
  [BLOCKCHAIN_NAME.FRAXTAL]: {
    name: 'Fraxtal',
    rpc: 'https://rpc.frax.com'
  },
  [BLOCKCHAIN_NAME.BERACHAIN]: {
    name: 'Berachain',
    rpc: 'https://rpc.berachain.com/'
  },
  [BLOCKCHAIN_NAME.SONEIUM]: {
    name: 'Soneium',
    rpc: 'https://rpc.soneium.org/'
  },
  [BLOCKCHAIN_NAME.WANCHAIN]: {
    name: 'Wanchain',
    rpc: 'https://gwan-ssl.wandevs.org:56891'
  },
  [BLOCKCHAIN_NAME.UNICHAIN]: {
    name: 'Unichain',
    rpc: 'https://mainnet.unichain.org/'
  },
  [BLOCKCHAIN_NAME.HEMI]: {
    name: 'Hemi',
    rpc: 'https://rpc.hemi.network/rpc'
  },
  [BLOCKCHAIN_NAME.PLASMA]: {
    name: 'Plasma',
    rpc: 'https://rpc.plasma.to'
  },
  [BLOCKCHAIN_NAME.MONAD]: {
    name: 'Monad',
    rpc: 'https://rpc.monad.xyz'
  }
};
