import { BLOCKCHAIN_NAME, EvmBlockchainName, TronBlockchainName, TronWebProvider } from 'rubic-sdk';

export const rpcList: Record<EvmBlockchainName, string[]> &
  Record<TronBlockchainName, TronWebProvider[]> = {
  [BLOCKCHAIN_NAME.ETHEREUM]: [
    'https://rpc.ankr.com/eth/cdb5678d9797006c10fa86c3ea17d7f3f1ead96554d393fa427112462e891eca',
    'https://eth.getblock.io/mainnet/?api_key=02530958-c8c4-4297-974c-66203e79800d'
  ],
  [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: [
    'https://rpc.ankr.com/bsc/cdb5678d9797006c10fa86c3ea17d7f3f1ead96554d393fa427112462e891eca',
    'https://bsc.getblock.io/mainnet/?api_key=02530958-c8c4-4297-974c-66203e79800d'
  ],
  [BLOCKCHAIN_NAME.POLYGON]: [
    'https://rpc.ankr.com/polygon/cdb5678d9797006c10fa86c3ea17d7f3f1ead96554d393fa427112462e891eca',
    'https://matic.getblock.io/mainnet/?api_key=02530958-c8c4-4297-974c-66203e79800d'
  ],
  [BLOCKCHAIN_NAME.POLYGON_ZKEVM]: [
    'https://rpc.ankr.com/polygon_zkevm/cdb5678d9797006c10fa86c3ea17d7f3f1ead96554d393fa427112462e891eca',
    'https://zkevm-rpc.com',
    'https://rpc.polygon-zkevm.gateway.fm',
    'https://1rpc.io/zkevm'
  ],
  [BLOCKCHAIN_NAME.HARMONY]: ['https://api.harmony.one', 'https://api.s0.t.hmny.io/'],
  [BLOCKCHAIN_NAME.AVALANCHE]: [
    'https://rpc.ankr.com/avalanche/cdb5678d9797006c10fa86c3ea17d7f3f1ead96554d393fa427112462e891eca',
    'https://avax.getblock.io/mainnet/ext/bc/C/rpc?api_key=02530958-c8c4-4297-974c-66203e79800d',
    'https://speedy-nodes-nyc.moralis.io/7625ae299d1e13d495412740/avalanche/mainnet'
  ],
  [BLOCKCHAIN_NAME.MOONRIVER]: [
    'https://moonriver-api.bwarelabs.com/e72ceb4c-1e99-4e9f-8f3c-83f0152ad69f',
    'https://rpc.moonriver.moonbeam.network'
  ],
  [BLOCKCHAIN_NAME.FANTOM]: [
    'https://rpc.ankr.com/fantom/cdb5678d9797006c10fa86c3ea17d7f3f1ead96554d393fa427112462e891eca',
    'https://speedy-nodes-nyc.moralis.io/106bebf40377b2e543f51299/fantom/mainnet'
  ],
  [BLOCKCHAIN_NAME.ARBITRUM]: [
    'https://rpc.ankr.com/arbitrum/cdb5678d9797006c10fa86c3ea17d7f3f1ead96554d393fa427112462e891eca',
    'https://arb1.arbitrum.io/rpc',
    'https://arbitrum.getblock.io/02530958-c8c4-4297-974c-66203e79800d/mainnet/'
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
    'https://mainnet.optimism.io'
  ],
  [BLOCKCHAIN_NAME.CRONOS]: ['https://evm-cronos.crypto.org'],
  [BLOCKCHAIN_NAME.OKE_X_CHAIN]: ['https://exchainrpc.okex.org'],
  [BLOCKCHAIN_NAME.GNOSIS]: [
    'https://rpc.ankr.com/gnosis/cdb5678d9797006c10fa86c3ea17d7f3f1ead96554d393fa427112462e891eca'
  ],
  [BLOCKCHAIN_NAME.FUSE]: ['https://fuse-rpc.gateway.pokt.network/'],
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
  [BLOCKCHAIN_NAME.BOBA_AVALANCHE]: ['https://avax.boba.network'],
  [BLOCKCHAIN_NAME.ASTAR_EVM]: [
    'https://evm.astar.network/',
    'https://astar.public.blastapi.io',
    'https://rpc.astar.network:8545'
  ],
  [BLOCKCHAIN_NAME.ETHEREUM_POW]: ['https://mainnet.ethereumpow.org/'],
  [BLOCKCHAIN_NAME.KAVA]: ['https://evm.kava.io'],
  [BLOCKCHAIN_NAME.TRON]: [
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
  [BLOCKCHAIN_NAME.METIS]: ['https://andromeda.metis.io/?owner=1088'],
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
  [BLOCKCHAIN_NAME.ZK_SYNC]: ['https://mainnet.era.zksync.io'],
  [BLOCKCHAIN_NAME.PULSECHAIN]: ['https://rpc.pulsechain.com'],
  [BLOCKCHAIN_NAME.LINEA]: [
    'https://linea-mainnet.infura.io/v3/30f7c1536c48439b834bb59e7dfe7d71',
    'https://linea.drpc.org',
    'https://1rpc.io/linea',
    'https://linea.blockpi.network/v1/rpc/public'
  ],
  [BLOCKCHAIN_NAME.BASE]: [
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
  ]
};
