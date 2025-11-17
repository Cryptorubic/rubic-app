import { BLOCKCHAIN_NAME, BlockchainName } from '@cryptorubic/core';
import { BlockchainTags } from '../../../components/blockchains-filter-list/models/BlockchainFilters';

export interface RankedBlockchain {
  name: BlockchainName;
  rank: number;
  tags: string[];
}

function setRankToNonEvmBlockchain(blockchain: BlockchainName): number {
  if (blockchain === BLOCKCHAIN_NAME.SOLANA) {
    return 0.74;
  }
  if (blockchain === BLOCKCHAIN_NAME.SUI) {
    return 0.7;
  }
  if (blockchain === BLOCKCHAIN_NAME.BITCOIN) {
    return 0.74;
  }
  if (blockchain === BLOCKCHAIN_NAME.TON) {
    return 0.73;
  }
  if (blockchain === BLOCKCHAIN_NAME.FILECOIN) {
    return 0.45;
  }
  if (blockchain === BLOCKCHAIN_NAME.FLOW) {
    return 0.35;
  }
  if (
    blockchain === BLOCKCHAIN_NAME.ICP ||
    blockchain === BLOCKCHAIN_NAME.IOTA ||
    blockchain === BLOCKCHAIN_NAME.KAVA_COSMOS
  ) {
    return 0.25;
  }
  if (
    blockchain === BLOCKCHAIN_NAME.NEO ||
    blockchain === BLOCKCHAIN_NAME.KUSAMA ||
    blockchain === BLOCKCHAIN_NAME.ONTOLOGY ||
    blockchain === BLOCKCHAIN_NAME.MINA_PROTOCOL
  ) {
    return 0.15;
  }
  return 0.4;
}

const notEvmChangeNowBlockchainsTagsList: Record<NotEvmChangeNowBlockchainsList, string[]> = {
  // [BLOCKCHAIN_NAME.ICP]: ['ICP'],
  [BLOCKCHAIN_NAME.CARDANO]: ['ADA'],

  // [BLOCKCHAIN_NAME.DOGECOIN]: ['DOGE'],
  [BLOCKCHAIN_NAME.POLKADOT]: ['DOT'],
  [BLOCKCHAIN_NAME.LITECOIN]: ['LTC'],
  [BLOCKCHAIN_NAME.MONERO]: ['XMR'],
  [BLOCKCHAIN_NAME.RIPPLE]: ['XRP'],
  [BLOCKCHAIN_NAME.ZILLIQA]: ['ZIL'],
  [BLOCKCHAIN_NAME.DASH]: ['DASH'],
  [BLOCKCHAIN_NAME.TEZOS]: ['XTZ'],
  // [BLOCKCHAIN_NAME.ASTAR]: ['ASTR'],
  [BLOCKCHAIN_NAME.STELLAR]: ['XLM'],
  [BLOCKCHAIN_NAME.NEO]: ['NEO'],
  [BLOCKCHAIN_NAME.NEAR]: ['NEAR'],
  [BLOCKCHAIN_NAME.SOLANA]: ['SOL', BlockchainTags.POPULAR],
  [BLOCKCHAIN_NAME.BITCOIN]: ['BTC'],
  // [BLOCKCHAIN_NAME.ALGORAND]: ['ALGO'],
  [BLOCKCHAIN_NAME.KAVA_COSMOS]: ['KAVA'],
  [BLOCKCHAIN_NAME.APTOS]: ['APT'],
  [BLOCKCHAIN_NAME.COSMOS]: ['ATOM'],
  // [BLOCKCHAIN_NAME.FLOW]: ['FLOW'],
  // [BLOCKCHAIN_NAME.HEDERA]: ['HBAR'],
  [BLOCKCHAIN_NAME.IOTA]: ['IOTA'],
  // [BLOCKCHAIN_NAME.KUSAMA]: ['KSM'],
  // [BLOCKCHAIN_NAME.MINA_PROTOCOL]: ['MINA'],
  // [BLOCKCHAIN_NAME.OSMOSIS]: ['OSMO'],
  // [BLOCKCHAIN_NAME.SIA]: ['SC'],
  // [BLOCKCHAIN_NAME.SECRET]: ['SCRT'],
  [BLOCKCHAIN_NAME.TON]: ['TON'],
  // [BLOCKCHAIN_NAME.WAVES]: ['WAVES'],
  // [BLOCKCHAIN_NAME.WAX]: ['WAXP'],
  // [BLOCKCHAIN_NAME.EOS]: ['EOS'],
  [BLOCKCHAIN_NAME.FILECOIN]: ['FIL'],
  // [BLOCKCHAIN_NAME.ONTOLOGY]: ['ONT'],
  [BLOCKCHAIN_NAME.XDC]: ['XDC'],
  [BLOCKCHAIN_NAME.SUI]: ['SUI']
};

export const notEvmChangeNowBlockchainsList = {
  [BLOCKCHAIN_NAME.DASH]: BLOCKCHAIN_NAME.DASH,
  [BLOCKCHAIN_NAME.MONERO]: BLOCKCHAIN_NAME.MONERO,
  [BLOCKCHAIN_NAME.CARDANO]: BLOCKCHAIN_NAME.CARDANO,
  [BLOCKCHAIN_NAME.COSMOS]: BLOCKCHAIN_NAME.COSMOS,
  [BLOCKCHAIN_NAME.LITECOIN]: BLOCKCHAIN_NAME.LITECOIN,
  // [BLOCKCHAIN_NAME.OSMOSIS]: BLOCKCHAIN_NAME.OSMOSIS,
  // [BLOCKCHAIN_NAME.HEDERA]: BLOCKCHAIN_NAME.HEDERA,
  [BLOCKCHAIN_NAME.RIPPLE]: BLOCKCHAIN_NAME.RIPPLE,
  // [BLOCKCHAIN_NAME.DOGECOIN]: BLOCKCHAIN_NAME.DOGECOIN,
  [BLOCKCHAIN_NAME.APTOS]: BLOCKCHAIN_NAME.APTOS,
  [BLOCKCHAIN_NAME.POLKADOT]: BLOCKCHAIN_NAME.POLKADOT,
  // [BLOCKCHAIN_NAME.ALGORAND]: BLOCKCHAIN_NAME.ALGORAND,
  [BLOCKCHAIN_NAME.STELLAR]: BLOCKCHAIN_NAME.STELLAR,
  // [BLOCKCHAIN_NAME.EOS]: BLOCKCHAIN_NAME.EOS,
  [BLOCKCHAIN_NAME.NEAR]: BLOCKCHAIN_NAME.NEAR,
  // [BLOCKCHAIN_NAME.ASTAR]: BLOCKCHAIN_NAME.ASTAR,

  // [BLOCKCHAIN_NAME.FLOW]: BLOCKCHAIN_NAME.FLOW,
  // [BLOCKCHAIN_NAME.ICP]: BLOCKCHAIN_NAME.ICP,
  [BLOCKCHAIN_NAME.IOTA]: BLOCKCHAIN_NAME.IOTA,
  [BLOCKCHAIN_NAME.KAVA_COSMOS]: BLOCKCHAIN_NAME.KAVA_COSMOS,
  // [BLOCKCHAIN_NAME.KUSAMA]: BLOCKCHAIN_NAME.KUSAMA,
  // [BLOCKCHAIN_NAME.MINA_PROTOCOL]: BLOCKCHAIN_NAME.MINA_PROTOCOL,
  [BLOCKCHAIN_NAME.NEO]: BLOCKCHAIN_NAME.NEO,
  // [BLOCKCHAIN_NAME.ONTOLOGY]: BLOCKCHAIN_NAME.ONTOLOGY,
  [BLOCKCHAIN_NAME.ZILLIQA]: BLOCKCHAIN_NAME.ZILLIQA,
  [BLOCKCHAIN_NAME.TEZOS]: BLOCKCHAIN_NAME.TEZOS,

  [BLOCKCHAIN_NAME.BITCOIN]: BLOCKCHAIN_NAME.BITCOIN,
  [BLOCKCHAIN_NAME.SOLANA]: BLOCKCHAIN_NAME.SOLANA,

  // [BLOCKCHAIN_NAME.SIA]: BLOCKCHAIN_NAME.SIA,
  // [BLOCKCHAIN_NAME.SECRET]: BLOCKCHAIN_NAME.SECRET,
  [BLOCKCHAIN_NAME.TON]: BLOCKCHAIN_NAME.TON,
  // [BLOCKCHAIN_NAME.WAVES]: BLOCKCHAIN_NAME.WAVES,
  // [BLOCKCHAIN_NAME.WAX]: BLOCKCHAIN_NAME.WAX,
  [BLOCKCHAIN_NAME.SUI]: BLOCKCHAIN_NAME.SUI,
  // [BLOCKCHAIN_NAME.CASPER]: BLOCKCHAIN_NAME.CASPER,

  [BLOCKCHAIN_NAME.FILECOIN]: BLOCKCHAIN_NAME.FILECOIN,

  [BLOCKCHAIN_NAME.XDC]: BLOCKCHAIN_NAME.XDC
  // [BLOCKCHAIN_NAME.KADENA]: BLOCKCHAIN_NAME.KADENA,
  // [BLOCKCHAIN_NAME.AION]: BLOCKCHAIN_NAME.AION,
  // [BLOCKCHAIN_NAME.ARDOR]: BLOCKCHAIN_NAME.ARDOR,
  // [BLOCKCHAIN_NAME.ARK]: BLOCKCHAIN_NAME.ARK,
  // [BLOCKCHAIN_NAME.STEEM]: BLOCKCHAIN_NAME.STEEM,
  // [BLOCKCHAIN_NAME.BAND_PROTOCOL]: BLOCKCHAIN_NAME.BAND_PROTOCOL,
  // [BLOCKCHAIN_NAME.BITCOIN_DIAMOND]: BLOCKCHAIN_NAME.BITCOIN_DIAMOND,
  // [BLOCKCHAIN_NAME.BSV]: BLOCKCHAIN_NAME.BSV,
  // [BLOCKCHAIN_NAME.BITCOIN_GOLD]: BLOCKCHAIN_NAME.BITCOIN_GOLD,
  // [BLOCKCHAIN_NAME.DECRED]: BLOCKCHAIN_NAME.DECRED,
  // [BLOCKCHAIN_NAME.DIGI_BYTE]: BLOCKCHAIN_NAME.DIGI_BYTE,
  // [BLOCKCHAIN_NAME.DIVI]: BLOCKCHAIN_NAME.DIVI,
  // [BLOCKCHAIN_NAME.MULTIVERS_X]: BLOCKCHAIN_NAME.MULTIVERS_X,
  // [BLOCKCHAIN_NAME.FIO_PROTOCOL]: BLOCKCHAIN_NAME.FIO_PROTOCOL,
  // [BLOCKCHAIN_NAME.FIRO]: BLOCKCHAIN_NAME.FIRO,
  // [BLOCKCHAIN_NAME.HELIUM]: BLOCKCHAIN_NAME.HELIUM,
  // [BLOCKCHAIN_NAME.ICON]: BLOCKCHAIN_NAME.ICON,
  // [BLOCKCHAIN_NAME.IOST]: BLOCKCHAIN_NAME.IOST,
  // [BLOCKCHAIN_NAME.KOMODO]: BLOCKCHAIN_NAME.KOMODO,
  // [BLOCKCHAIN_NAME.LISK]: BLOCKCHAIN_NAME.LISK,
  // [BLOCKCHAIN_NAME.TERRA]: BLOCKCHAIN_NAME.TERRA,
  // [BLOCKCHAIN_NAME.TERRA_CLASSIC]: BLOCKCHAIN_NAME.TERRA_CLASSIC,
  // [BLOCKCHAIN_NAME.NANO]: BLOCKCHAIN_NAME.NANO,
  // [BLOCKCHAIN_NAME.PIVX]: BLOCKCHAIN_NAME.PIVX,
  // [BLOCKCHAIN_NAME.POLYX]: BLOCKCHAIN_NAME.POLYX,
  // [BLOCKCHAIN_NAME.QTUM]: BLOCKCHAIN_NAME.QTUM,
  // [BLOCKCHAIN_NAME.THOR_CHAIN]: BLOCKCHAIN_NAME.THOR_CHAIN,
  // [BLOCKCHAIN_NAME.RAVENCOIN]: BLOCKCHAIN_NAME.RAVENCOIN,
  // [BLOCKCHAIN_NAME.STRATIS]: BLOCKCHAIN_NAME.STRATIS,
  // [BLOCKCHAIN_NAME.STACKS]: BLOCKCHAIN_NAME.STACKS,
  // [BLOCKCHAIN_NAME.SOLAR]: BLOCKCHAIN_NAME.SOLAR,
  // [BLOCKCHAIN_NAME.VE_CHAIN]: BLOCKCHAIN_NAME.VE_CHAIN,
  // [BLOCKCHAIN_NAME.DX_CHAIN]: BLOCKCHAIN_NAME.DX_CHAIN,
  // [BLOCKCHAIN_NAME.E_CASH]: BLOCKCHAIN_NAME.E_CASH,
  // [BLOCKCHAIN_NAME.NEM]: BLOCKCHAIN_NAME.NEM,
  // [BLOCKCHAIN_NAME.VERGE]: BLOCKCHAIN_NAME.VERGE,
  // [BLOCKCHAIN_NAME.SYMBOL]: BLOCKCHAIN_NAME.SYMBOL,
  // [BLOCKCHAIN_NAME.ZCASH]: BLOCKCHAIN_NAME.ZCASH,
  // [BLOCKCHAIN_NAME.HORIZEN]: BLOCKCHAIN_NAME.HORIZEN
};

function setNonEvmChainTag(blockchain: NotEvmChangeNowBlockchainsList): string[] {
  const chainTags = [...notEvmChangeNowBlockchainsTagsList[blockchain], BlockchainTags.NON_EVM];

  if (blockchain === BLOCKCHAIN_NAME.TON) {
    chainTags.push(BlockchainTags.POPULAR);
  }
  if (blockchain === BLOCKCHAIN_NAME.BITCOIN) {
    chainTags.push(BlockchainTags.POPULAR);
  }

  return chainTags;
}

const notEvmChangeNowFormattedBlockchainsList = Object.values(notEvmChangeNowBlockchainsList).map(
  blockchain => ({
    name: blockchain,
    rank: setRankToNonEvmBlockchain(blockchain),
    tags: setNonEvmChainTag(blockchain)
  })
);

export const blockchainsList: RankedBlockchain[] = [
  {
    name: BLOCKCHAIN_NAME.ETHEREUM,
    rank: 1,
    tags: ['ETH', BlockchainTags.POPULAR, BlockchainTags.EVM]
  },
  {
    name: BLOCKCHAIN_NAME.ARBITRUM,
    rank: 0.75,
    tags: ['ETH', BlockchainTags.POPULAR, BlockchainTags.EVM, BlockchainTags.LAYER_2]
  },
  {
    name: BLOCKCHAIN_NAME.POLYGON,
    rank: 0.75,
    tags: ['POL', BlockchainTags.POPULAR, BlockchainTags.EVM]
  },
  {
    name: BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN,
    rank: 0.75,
    tags: ['BNB', BlockchainTags.POPULAR, BlockchainTags.EVM]
  },
  {
    name: BLOCKCHAIN_NAME.BASE,
    rank: 0.75,
    tags: [
      'ETH',
      BlockchainTags.POPULAR,
      BlockchainTags.EVM,
      BlockchainTags.PROMO,
      BlockchainTags.LAYER_2
    ]
  },
  {
    name: BLOCKCHAIN_NAME.TRON,
    rank: 0.74,
    tags: ['TRX', BlockchainTags.NON_EVM, BlockchainTags.POPULAR]
  },
  {
    name: BLOCKCHAIN_NAME.PLASMA,
    rank: 0.73,
    tags: ['XPL', BlockchainTags.POPULAR, BlockchainTags.EVM, BlockchainTags.NEW]
  },
  {
    name: BLOCKCHAIN_NAME.LINEA,
    rank: 0.73,
    tags: [
      'ETH',
      BlockchainTags.POPULAR,
      BlockchainTags.EVM,
      BlockchainTags.PROMO,
      BlockchainTags.LAYER_2
    ]
  },
  {
    name: BLOCKCHAIN_NAME.ZK_SYNC,
    rank: 0.73,
    tags: [
      'ETH',
      BlockchainTags.POPULAR,
      BlockchainTags.EVM,
      BlockchainTags.PROMO,
      BlockchainTags.LAYER_2
    ]
  },
  {
    name: BLOCKCHAIN_NAME.OPTIMISM,
    rank: 0.73,
    tags: [BlockchainTags.EVM, BlockchainTags.POPULAR]
  },
  {
    name: BLOCKCHAIN_NAME.UNICHAIN,
    rank: 0.5,
    tags: ['ETH', BlockchainTags.EVM]
  },
  // @DELETE
  // {
  //   name: BLOCKCHAIN_NAME.WANCHAIN,
  //   rank: 0.5,
  //   tags: ['WAN', BlockchainTags.NEW, BlockchainTags.EVM]
  { name: BLOCKCHAIN_NAME.AVALANCHE, rank: 0.5, tags: ['AVAX', BlockchainTags.EVM] },
  {
    name: BLOCKCHAIN_NAME.SCROLL,
    rank: 0.5,
    tags: [
      'ETH',
      BlockchainTags.POPULAR,
      BlockchainTags.EVM,
      BlockchainTags.PROMO,
      BlockchainTags.LAYER_2
    ]
  },
  {
    name: BLOCKCHAIN_NAME.BERACHAIN,
    rank: 0.5,
    tags: ['ETH', BlockchainTags.POPULAR, BlockchainTags.EVM, BlockchainTags.LAYER_2]
  },
  {
    name: BLOCKCHAIN_NAME.MORPH,
    rank: 0.5,
    tags: ['ETH', BlockchainTags.EVM, BlockchainTags.LAYER_2, BlockchainTags.POPULAR]
  },
  {
    name: BLOCKCHAIN_NAME.FRAXTAL,
    rank: 0.5,
    tags: ['frxETH', BlockchainTags.EVM, BlockchainTags.LAYER_2]
  },
  // {
  //   name: BLOCKCHAIN_NAME.SONIC,
  //   rank: 0.5,
  //   tags: ['ETH', BlockchainTags.EVM, BlockchainTags.POPULAR, BlockchainTags.NEW]
  // },
  {
    name: BLOCKCHAIN_NAME.SONEIUM,
    rank: 0.5,
    tags: ['ETH', BlockchainTags.EVM]
  },
  {
    name: BLOCKCHAIN_NAME.GRAVITY,
    rank: 0.5,
    tags: ['ETH', BlockchainTags.EVM, BlockchainTags.POPULAR]
  },
  {
    name: BLOCKCHAIN_NAME.MODE,
    rank: 0.5,
    tags: ['ETH', BlockchainTags.POPULAR, BlockchainTags.EVM, BlockchainTags.LAYER_2]
  },
  {
    name: BLOCKCHAIN_NAME.BLAST,
    rank: 0.5,
    tags: [
      'ETH',
      BlockchainTags.POPULAR,
      BlockchainTags.EVM,
      BlockchainTags.PROMO,
      BlockchainTags.LAYER_2
    ]
  },
  {
    name: BLOCKCHAIN_NAME.MANTLE,
    rank: 0.5,
    tags: ['MNT', BlockchainTags.EVM, BlockchainTags.LAYER_2]
  },
  {
    name: BLOCKCHAIN_NAME.METIS,
    rank: 0.5,
    tags: [BlockchainTags.EVM, BlockchainTags.LAYER_2]
  },
  {
    name: BLOCKCHAIN_NAME.MANTA_PACIFIC,
    rank: 0.5,
    tags: ['ETH', BlockchainTags.EVM, BlockchainTags.LAYER_2]
  },

  { name: BLOCKCHAIN_NAME.FANTOM, rank: 0.5, tags: ['FTM', BlockchainTags.EVM] },
  { name: BLOCKCHAIN_NAME.CRONOS, rank: 0.5, tags: ['CRO', BlockchainTags.EVM] },
  {
    name: BLOCKCHAIN_NAME.POLYGON_ZKEVM,
    rank: 0.5,
    tags: ['ETH', BlockchainTags.EVM, BlockchainTags.LAYER_2]
  },
  {
    name: BLOCKCHAIN_NAME.PULSECHAIN,
    rank: 0.5,
    tags: ['PLS', BlockchainTags.POPULAR, BlockchainTags.EVM]
  },
  {
    name: BLOCKCHAIN_NAME.TAIKO,
    rank: 0.45,
    tags: ['ETH', BlockchainTags.POPULAR, BlockchainTags.EVM, BlockchainTags.LAYER_2]
  },
  {
    name: BLOCKCHAIN_NAME.HEMI,
    rank: 0.45,
    tags: ['ETH', BlockchainTags.POPULAR, BlockchainTags.EVM]
  },
  {
    name: BLOCKCHAIN_NAME.ROOTSTOCK,
    rank: 0.45,
    tags: ['RBTC', BlockchainTags.POPULAR, BlockchainTags.EVM, BlockchainTags.LAYER_2]
  },
  // {
  //   name: BLOCKCHAIN_NAME.BITLAYER,
  //   rank: 0.45,
  //   tags: ['BTC', BlockchainTags.EVM, BlockchainTags.LAYER_2, BlockchainTags.POPULAR]
  // },
  // {
  //   name: BLOCKCHAIN_NAME.MERLIN,
  //   rank: 0.45,
  //   tags: ['BTC', BlockchainTags.EVM, BlockchainTags.LAYER_2]
  // },
  {
    name: BLOCKCHAIN_NAME.XLAYER,
    rank: 0.4,
    tags: ['OKB', BlockchainTags.EVM, BlockchainTags.LAYER_2]
  },
  {
    name: BLOCKCHAIN_NAME.SEI,
    rank: 0.4,
    tags: ['ETH', BlockchainTags.EVM, BlockchainTags.POPULAR]
  },
  // {
  //   name: BLOCKCHAIN_NAME.ZK_LINK,
  //   rank: 0.4,
  //   tags: ['ETH', BlockchainTags.EVM, BlockchainTags.LAYER_2]
  // },
  // {
  //   name: BLOCKCHAIN_NAME.ZK_FAIR,
  //   rank: 0.4,
  //   tags: ['USDC', BlockchainTags.EVM, BlockchainTags.LAYER_2]
  // },
  // {
  //   name: BLOCKCHAIN_NAME.HORIZEN_EON,
  //   rank: 0.4,
  //   tags: ['ZEN', BlockchainTags.EVM, BlockchainTags.LAYER_2]
  // },
  {
    name: BLOCKCHAIN_NAME.ZETACHAIN,
    rank: 0.4,
    tags: ['ZETA', BlockchainTags.POPULAR, BlockchainTags.EVM]
  },
  {
    name: BLOCKCHAIN_NAME.BAHAMUT,
    rank: 0.4,
    tags: ['FTN', BlockchainTags.EVM]
  },
  // { name: BLOCKCHAIN_NAME.MOONBEAM, rank: 0.4, tags: ['GLMR', BlockchainTags.EVM] },
  // { name: BLOCKCHAIN_NAME.MOONRIVER, rank: 0.4, tags: ['MOVR', BlockchainTags.EVM] },
  { name: BLOCKCHAIN_NAME.CELO, rank: 0.4, tags: [BlockchainTags.EVM] },
  // {
  //   name: BLOCKCHAIN_NAME.ASTAR_EVM,
  //   rank: 0.35,
  //   tags: ['ASTR', BlockchainTags.EVM, BlockchainTags.LAYER_2]
  // },
  {
    name: BLOCKCHAIN_NAME.AURORA,
    rank: 0.35,
    tags: ['ETH', BlockchainTags.EVM, BlockchainTags.LAYER_2]
  },
  // {
  //   name: BLOCKCHAIN_NAME.BOBA,
  //   rank: 0.35,
  //   tags: ['ETH', BlockchainTags.EVM, BlockchainTags.LAYER_2]
  // },
  // { name: BLOCKCHAIN_NAME.FUSE, rank: 0.3, tags: [BlockchainTags.EVM] },
  // { name: BLOCKCHAIN_NAME.KAVA, rank: 0.2, tags: [BlockchainTags.EVM] },
  // { name: BLOCKCHAIN_NAME.KLAYTN, rank: 0.2, tags: [BlockchainTags.EVM] },
  // { name: BLOCKCHAIN_NAME.OASIS, rank: 0.1, tags: ['ROSE', BlockchainTags.EVM] },
  // { name: BLOCKCHAIN_NAME.OKE_X_CHAIN, rank: 0.1, tags: ['OKT', BlockchainTags.EVM] },
  // { name: BLOCKCHAIN_NAME.TELOS, rank: 0, tags: ['TLOS', BlockchainTags.EVM] },
  // { name: BLOCKCHAIN_NAME.VELAS, rank: 0, tags: ['VLX', BlockchainTags.EVM] },
  // { name: BLOCKCHAIN_NAME.SYSCOIN, rank: 0, tags: [BlockchainTags.EVM] },

  // {
  //   name: BLOCKCHAIN_NAME.CORE,
  //   rank: 0,
  //   tags: ['CORE', BlockchainTags.EVM]
  // },

  // { name: BLOCKCHAIN_NAME.BOBA_BSC, rank: 0, tags: [BlockchainTags.EVM, BlockchainTags.LAYER_2] },

  { name: BLOCKCHAIN_NAME.GNOSIS, rank: 0, tags: ['XDAI', BlockchainTags.EVM] },
  // BLOCKCHAIN_NAME.BITGERT,
  // BLOCKCHAIN_NAME.BITCOIN_CASH,
  // BLOCKCHAIN_NAME.ETHEREUM_CLASSIC,
  { name: BLOCKCHAIN_NAME.FLARE, rank: 0, tags: ['FLR', BlockchainTags.EVM] },
  // BLOCKCHAIN_NAME.IOTEX,
  // BLOCKCHAIN_NAME.THETA,
  ...notEvmChangeNowFormattedBlockchainsList
];

export const blockchainRanks: Record<BlockchainName, number> = {
  ...Object.values(BLOCKCHAIN_NAME).reduce(
    (acc, name) => ({ ...acc, [name]: 0 }),
    {} as Record<BlockchainName, number>
  ),
  ...blockchainsList.reduce(
    (acc, chainConfig) => ({ ...acc, [chainConfig.name]: chainConfig.rank }),
    {} as Record<BlockchainName, number>
  )
};

export type NotEvmChangeNowBlockchainsList =
  (typeof notEvmChangeNowBlockchainsList)[keyof typeof notEvmChangeNowBlockchainsList];

export const temporarelyDisabledBlockchains: BlockchainName[] = [
  BLOCKCHAIN_NAME.GRAVITY,
  BLOCKCHAIN_NAME.ZETACHAIN,
  BLOCKCHAIN_NAME.CRONOS,
  BLOCKCHAIN_NAME.CELO,
  BLOCKCHAIN_NAME.ROOTSTOCK,
  BLOCKCHAIN_NAME.AURORA,
  BLOCKCHAIN_NAME.APTOS,
  BLOCKCHAIN_NAME.SEI,
  BLOCKCHAIN_NAME.MORPH
];
