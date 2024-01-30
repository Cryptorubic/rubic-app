import {
  BLOCKCHAIN_NAME,
  EvmBlockchainName,
  SolanaBlockchainName,
  TronBlockchainName,
  TronWebProvider
} from 'rubic-sdk';

export const rpcList: Record<EvmBlockchainName, string[]> &
  Record<TronBlockchainName, TronWebProvider[]> &
  Record<SolanaBlockchainName, string[]> = {
  [BLOCKCHAIN_NAME.ETHEREUM]: [
    'https://rpc.ankr.com/eth/cdb5678d9797006c10fa86c3ea17d7f3f1ead96554d393fa427112462e891eca',
    'https://eth.getblock.io/mainnet/?api_key=02530958-c8c4-4297-974c-66203e79800d',
    'https://eth.llamarpc.com',
    'https://rpc.ankr.com/eth'
  ],
  [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: [
    'https://rpc.ankr.com/bsc/cdb5678d9797006c10fa86c3ea17d7f3f1ead96554d393fa427112462e891eca',
    'https://bsc.getblock.io/mainnet/?api_key=02530958-c8c4-4297-974c-66203e79800d',
    'https://binance.llamarpc.com',
    'https://rpc.ankr.com/bsc'
  ],
  [BLOCKCHAIN_NAME.POLYGON]: [
    'https://rpc.ankr.com/polygon/cdb5678d9797006c10fa86c3ea17d7f3f1ead96554d393fa427112462e891eca',
    'https://matic.getblock.io/mainnet/?api_key=02530958-c8c4-4297-974c-66203e79800d',
    'https://polygon.llamarpc.com',
    'https://1rpc.io/matic',
    'https://rpc.ankr.com/polygon'
  ],
  [BLOCKCHAIN_NAME.POLYGON_ZKEVM]: [
    'https://rpc.ankr.com/polygon_zkevm/cdb5678d9797006c10fa86c3ea17d7f3f1ead96554d393fa427112462e891eca',
    // 'https://nd-286-108-077.p2pify.com/2bf96e69ad7bef27f9598f04c61ed737',
    'https://go.getblock.io/dc26bc690261423eba3ddcf356fcda2c',
    'https://zkevm-rpc.com',
    'https://1rpc.io/polygon/zkevm',
    'https://polygon-zkevm-mainnet.public.blastapi.io'
  ],
  [BLOCKCHAIN_NAME.HARMONY]: ['https://api.harmony.one', 'https://api.s0.t.hmny.io/'],
  [BLOCKCHAIN_NAME.AVALANCHE]: [
    'https://rpc.ankr.com/avalanche/cdb5678d9797006c10fa86c3ea17d7f3f1ead96554d393fa427112462e891eca',
    'https://avax.getblock.io/mainnet/ext/bc/C/rpc?api_key=02530958-c8c4-4297-974c-66203e79800d',
    'https://1rpc.io/avax/c',
    'https://rpc.ankr.com/avalanche'
  ],
  [BLOCKCHAIN_NAME.MOONRIVER]: [
    'https://moonriver.getblock.io/02530958-c8c4-4297-974c-66203e79800d/mainnet/',
    'https://moonriver.public.blastapi.io',
    'https://moonriver.unitedbloc.com:2000'
  ],
  [BLOCKCHAIN_NAME.FANTOM]: [
    'https://rpc.ankr.com/fantom/cdb5678d9797006c10fa86c3ea17d7f3f1ead96554d393fa427112462e891eca',
    'https://ftm.getblock.io/02530958-c8c4-4297-974c-66203e79800d/mainnet/',
    'https://rpc.ankr.com/fantom',
    'https://1rpc.io/ftm'
  ],
  [BLOCKCHAIN_NAME.ARBITRUM]: [
    'https://rpc.ankr.com/arbitrum/cdb5678d9797006c10fa86c3ea17d7f3f1ead96554d393fa427112462e891eca',
    'https://arb.getblock.io/02530958-c8c4-4297-974c-66203e79800d/mainnet/',
    'https://arb1.arbitrum.io/rpc',
    'https://arbitrum.llamarpc.com',
    'https://rpc.ankr.com/arbitrum'
  ],
  [BLOCKCHAIN_NAME.AURORA]: ['https://mainnet.aurora.dev'],
  [BLOCKCHAIN_NAME.TELOS]: [
    'https://mainnet.telos.net/evm',
    'https://rpc1.eu.telos.net/evm',
    'https://rpc2.eu.telos.net/evm',
    'https://rpc1.us.telos.net/evm',
    'https://rpc1.us.telos.net/evm'
  ],
  [BLOCKCHAIN_NAME.OPTIMISM]: [
    'https://rpc.ankr.com/optimism/cdb5678d9797006c10fa86c3ea17d7f3f1ead96554d393fa427112462e891eca',
    'https://op.getblock.io/02530958-c8c4-4297-974c-66203e79800d/mainnet/',
    'https://optimism.llamarpc.com',
    'https://rpc.ankr.com/optimism'
  ],
  [BLOCKCHAIN_NAME.CRONOS]: ['https://evm-cronos.crypto.org'],
  [BLOCKCHAIN_NAME.OKE_X_CHAIN]: ['https://exchainrpc.okex.org'],
  [BLOCKCHAIN_NAME.GNOSIS]: [
    'https://rpc.ankr.com/gnosis/cdb5678d9797006c10fa86c3ea17d7f3f1ead96554d393fa427112462e891eca'
  ],
  [BLOCKCHAIN_NAME.FUSE]: ['https://fuse-pokt.nodies.app', 'https://rpc.fuse.io'],
  [BLOCKCHAIN_NAME.MOONBEAM]: [
    'https://rpc.ankr.com/moonbeam/cdb5678d9797006c10fa86c3ea17d7f3f1ead96554d393fa427112462e891eca'
  ],
  [BLOCKCHAIN_NAME.CELO]: [
    'https://rpc.ankr.com/celo/cdb5678d9797006c10fa86c3ea17d7f3f1ead96554d393fa427112462e891eca'
  ],
  [BLOCKCHAIN_NAME.BOBA]: [
    'https://mainnet.boba.network',
    'https://lightning-replica.boba.network'
  ],
  [BLOCKCHAIN_NAME.BOBA_BSC]: ['https://bnb.boba.network'],
  [BLOCKCHAIN_NAME.ASTAR_EVM]: [
    'https://evm.astar.network/',
    'https://astar.public.blastapi.io',
    'https://rpc.astar.network:8545'
  ],
  [BLOCKCHAIN_NAME.ETHEREUM_POW]: ['https://mainnet.ethereumpow.org/'],
  [BLOCKCHAIN_NAME.KAVA]: ['https://evm.kava.io'],
  [BLOCKCHAIN_NAME.TRON]: [
    {
      fullHost: 'https://api.trongrid.io'
    },
    {
      fullHost:
        'https://rpc.ankr.com/premium-http/tron/cdb5678d9797006c10fa86c3ea17d7f3f1ead96554d393fa427112462e891eca'
    }
  ],
  /*
  [BLOCKCHAIN_NAME.SOLANA]: [
    'https://sol.getblock.io/mainnet/?api_key=02530958-c8c4-4297-974c-66203e79800d'
  ],
  [BLOCKCHAIN_NAME.NEAR]: ['https://rpc.testnet.near.org']
   */
  [BLOCKCHAIN_NAME.BITGERT]: [
    'https://serverrpc.com',
    'https://dedicated.brisescan.com/',
    'https://rpc-bitgert-vefi.com',
    'https://rpc.icecreamswap.com',
    'https://mainnet-rpc.brisescan.com',
    'https://chainrpc.com'
  ],
  [BLOCKCHAIN_NAME.OASIS]: ['https://emerald.oasis.dev'],
  [BLOCKCHAIN_NAME.METIS]: [
    'https://rpc.ankr.com/metis/cdb5678d9797006c10fa86c3ea17d7f3f1ead96554d393fa427112462e891eca',
    'https://andromeda.metis.io/?owner=1088',
    'https://metis-mainnet.public.blastapi.io'
  ],
  [BLOCKCHAIN_NAME.DFK]: [
    'https://subnets.avax.network/defi-kingdoms/dfk-chain/rpc',
    'https://avax-dfk.gateway.pokt.network/v1/lb/6244818c00b9f0003ad1b619/ext/bc/q2aTwKuyzgs8pynF7UXBZCU7DejbZbZ6EUyHr3JQzYgwNPUPi/rpc'
  ],
  [BLOCKCHAIN_NAME.KLAYTN]: [
    'https://rpc.ankr.com/klaytn/cdb5678d9797006c10fa86c3ea17d7f3f1ead96554d393fa427112462e891eca',
    'https://public-en-cypress.klaytn.net/',
    'https://public-node-api.klaytnapi.com/v1/cypress',
    'https://cypress.fandom.finance/archive',
    'https://klaytn01.fandom.finance',
    'https://klaytn02.fandom.finance',
    'https://klaytn03.fandom.finance',
    'https://klaytn04.fandom.finance',
    'https://klaytn05.fandom.finance'
  ],
  [BLOCKCHAIN_NAME.VELAS]: ['https://evmexplorer.velas.com/rpc', 'https://explorer.velas.com/rpc'],
  [BLOCKCHAIN_NAME.SYSCOIN]: ['https://rpc.syscoin.org', 'https://rpc.ankr.com/syscoin'],
  [BLOCKCHAIN_NAME.ETHEREUM_CLASSIC]: [
    'https://besu-at.etc-network.info',
    'https://geth-at.etc-network.info'
  ],
  [BLOCKCHAIN_NAME.FLARE]: ['https://flare-api.flare.network/ext/C/rpc'],
  [BLOCKCHAIN_NAME.IOTEX]: ['https://rpc.ankr.com/iotex', 'https://pokt-api.iotex.io'],
  [BLOCKCHAIN_NAME.THETA]: ['https://eth-rpc-api.thetatoken.org/rpc'],
  [BLOCKCHAIN_NAME.BITCOIN_CASH]: [
    'https://smartbch.greyh.at',
    'https://smartbch.fountainhead.cash/mainnet'
  ],
  [BLOCKCHAIN_NAME.ZK_SYNC]: [
    'https://rpc.ankr.com/zksync_era/cdb5678d9797006c10fa86c3ea17d7f3f1ead96554d393fa427112462e891eca',
    'https://zksync.getblock.io/02530958-c8c4-4297-974c-66203e79800d/mainnet/',
    'https://rpc.ankr.com/zksync_era',
    'https://mainnet.era.zksync.io'
  ],
  [BLOCKCHAIN_NAME.PULSECHAIN]: ['https://rpc.pulsechain.com', 'https://pulsechain.publicnode.com'],
  [BLOCKCHAIN_NAME.LINEA]: [
    'https://rpc.ankr.com/linea/cdb5678d9797006c10fa86c3ea17d7f3f1ead96554d393fa427112462e891eca',
    'https://linea.getblock.io/02530958-c8c4-4297-974c-66203e79800d/mainnet/',
    'https://linea-mainnet.infura.io/v3/30f7c1536c48439b834bb59e7dfe7d71',
    'https://linea.drpc.org',
    'https://linea.blockpi.network/v1/rpc/public'
  ],
  [BLOCKCHAIN_NAME.BASE]: [
    'https://rpc.ankr.com/base/cdb5678d9797006c10fa86c3ea17d7f3f1ead96554d393fa427112462e891eca',
    'https://base.getblock.io/02530958-c8c4-4297-974c-66203e79800d/mainnet/',
    'https://mainnet.base.org',
    'https://1rpc.io/base',
    'https://base.blockpi.network/v1/rpc/public',
    'https://base-mainnet.public.blastapi.io'
  ],
  [BLOCKCHAIN_NAME.MANTLE]: [
    'https://rpc.ankr.com/mantle/cdb5678d9797006c10fa86c3ea17d7f3f1ead96554d393fa427112462e891eca',
    'https://mantle-mainnet.public.blastapi.io',
    'https://rpc.mantle.xyz',
    'https://mantle.publicnode.com'
  ],
  [BLOCKCHAIN_NAME.FUJI]: [
    'https://endpoints.omniatech.io/v1/avax/fuji/public',
    'https://rpc.ankr.com/avalanche_fuji',
    'https://ava-testnet.public.blastapi.io/ext/bc/C/rpc'
  ],
  [BLOCKCHAIN_NAME.MUMBAI]: [
    'https://rpc-mumbai.maticvigil.com',
    'https://rpc.ankr.com/polygon_mumbai',
    'https://polygon-testnet.public.blastapi.io',
    'https://endpoints.omniatech.io/v1/matic/mumbai/public'
  ],
  [BLOCKCHAIN_NAME.GOERLI]: [
    'https://goerli.blockpi.network/v1/rpc/public',
    'https://rpc.ankr.com/eth_goerli',
    'https://eth-goerli.public.blastapi.io',
    'https://endpoints.omniatech.io/v1/eth/goerli/public'
  ],
  [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN_TESTNET]: [
    'https://data-seed-prebsc-1-s3.binance.org:8545',
    'https://endpoints.omniatech.io/v1/bsc/testnet/public',
    'https://bsc-testnet.public.blastapi.io'
  ],
  [BLOCKCHAIN_NAME.SCROLL_SEPOLIA]: ['https://sepolia-rpc.scroll.io/'],
  [BLOCKCHAIN_NAME.ARTHERA]: [],
  [BLOCKCHAIN_NAME.ZETACHAIN]: [
    'https://zetachain-athens-evm.blockpi.network/v1/rpc/public',
    'https://rpc.ankr.com/zetachain_evm_athens_testnet'
  ],
  [BLOCKCHAIN_NAME.TAIKO]: ['https://rpc.jolnir.taiko.xyz'],
  [BLOCKCHAIN_NAME.SEPOLIA]: ['https://l1rpc.jolnir.taiko.xyz'],
  [BLOCKCHAIN_NAME.MANTA_PACIFIC]: ['https://pacific-rpc.manta.network/http'],
  [BLOCKCHAIN_NAME.SCROLL]: [
    'https://rpc.ankr.com/scroll/cdb5678d9797006c10fa86c3ea17d7f3f1ead96554d393fa427112462e891eca',
    'https://rpc.ankr.com/scroll',
    'https://rpc.scroll.io/',
    'https://1rpc.io/scroll'
  ],
  [BLOCKCHAIN_NAME.STARKNET]: [
    'https://rpc.starknet.lava.build',
    'https://starknet-mainnet.public.blastapi.io',
    'https://data.voyager.online/',
    'https://starknet-mainnet.s.chainbase.com/v1/2Z4bzrFJWgzsqK5mltnTKKtjEK4'
  ],
  [BLOCKCHAIN_NAME.SOLANA]: [
    'https://rpc.ankr.com/solana/cdb5678d9797006c10fa86c3ea17d7f3f1ead96554d393fa427112462e891eca'
  ]
};
