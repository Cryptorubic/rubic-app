import { Token } from '@app/shared/models/tokens/token';
import {
  BlockchainName,
  BLOCKCHAIN_NAME,
  nativeTokensList,
  wrappedNativeTokensList
} from 'rubic-sdk';

const defaultTokenParams = {
  rank: 0.001,
  price: 0
};

export const defaultTokens: Record<BlockchainName, Token[]> = {
  [BLOCKCHAIN_NAME.ETHEREUM]: [
    {
      ...nativeTokensList[BLOCKCHAIN_NAME.ETHEREUM],
      ...defaultTokenParams,
      image: 'assets/images/icons/default-tokens/eth.png'
    } as Token,
    {
      ...wrappedNativeTokensList[BLOCKCHAIN_NAME.ETHEREUM],
      ...defaultTokenParams,
      image: 'assets/images/icons/default-tokens/weth.png'
    } as Token,
    {
      blockchain: BLOCKCHAIN_NAME.ETHEREUM,
      address: '0xa4eed63db85311e22df4473f87ccfc3dadcfa3e3',
      name: 'Rubic',
      symbol: 'RBC',
      decimals: 18,
      image: 'assets/images/icons/default-tokens/rbc.png',
      ...defaultTokenParams
    },
    {
      blockchain: BLOCKCHAIN_NAME.ETHEREUM,
      address: '0xdac17f958d2ee523a2206206994597c13d831ec7',
      name: 'Tether USD',
      symbol: 'USDT',
      decimals: 6,
      image: 'assets/images/icons/default-tokens/usdt.png',
      ...defaultTokenParams
    },
    {
      blockchain: BLOCKCHAIN_NAME.ETHEREUM,
      address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
      name: 'USD Coin',
      symbol: 'USDC',
      decimals: 6,
      image: 'assets/images/icons/default-tokens/usdc.png',
      ...defaultTokenParams
    }
  ],
  [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: [
    {
      ...nativeTokensList[BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN],
      ...defaultTokenParams,
      image: 'assets/images/icons/default-tokens/bnb.png'
    } as Token,
    {
      ...wrappedNativeTokensList[BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN],
      ...defaultTokenParams,
      image: 'assets/images/icons/default-tokens/wbnb.png'
    } as Token,
    {
      blockchain: BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN,
      address: '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d',
      name: 'USD Coin',
      symbol: 'USDC',
      decimals: 18,
      image: 'assets/images/icons/default-tokens/usdc.png',
      ...defaultTokenParams
    },
    {
      blockchain: BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN,
      address: '0x55d398326f99059ff775485246999027b3197955',
      name: 'Tether USD',
      symbol: 'USDT',
      decimals: 18,
      image: 'assets/images/icons/default-tokens/usdt.png',
      ...defaultTokenParams
    },
    {
      blockchain: BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN,
      address: '0x8e3bcc334657560253b83f08331d85267316e08a',
      name: 'Rubic',
      symbol: 'BRBC',
      decimals: 18,
      image: 'assets/images/icons/default-tokens/rbc.png',
      ...defaultTokenParams
    }
  ],
  [BLOCKCHAIN_NAME.POLYGON]: [
    {
      ...nativeTokensList[BLOCKCHAIN_NAME.POLYGON],
      ...defaultTokenParams,
      image: 'assets/images/icons/default-tokens/matic.png'
    } as Token,
    {
      ...wrappedNativeTokensList[BLOCKCHAIN_NAME.POLYGON],
      ...defaultTokenParams,
      image: 'assets/images/icons/default-tokens/wmatic.png'
    } as Token,
    {
      blockchain: BLOCKCHAIN_NAME.POLYGON,
      address: '0xc3cffdaf8f3fdf07da6d5e3a89b8723d5e385ff8',
      name: 'Rubic (PoS)',
      symbol: 'RBC',
      decimals: 18,
      image: 'assets/images/icons/default-tokens/rbc.png',
      ...defaultTokenParams
    },
    {
      blockchain: BLOCKCHAIN_NAME.POLYGON,
      address: '0x2791bca1f2de4661ed88a30c99a7a9449aa84174',
      name: 'USD Coin (PoS)',
      symbol: 'USDC',
      decimals: 6,
      image: 'assets/images/icons/default-tokens/usdc.png',
      ...defaultTokenParams
    },
    {
      blockchain: BLOCKCHAIN_NAME.POLYGON,
      address: '0xc2132d05d31c914a87c6611c10748aeb04b58e8f',
      name: '(PoS) Tether USD',
      symbol: 'USDT',
      decimals: 6,
      image: 'assets/images/icons/default-tokens/usdt.png',
      ...defaultTokenParams
    }
  ],
  [BLOCKCHAIN_NAME.AVALANCHE]: [
    {
      ...nativeTokensList[BLOCKCHAIN_NAME.AVALANCHE],
      ...defaultTokenParams,
      image: 'assets/images/icons/default-tokens/avax.png'
    } as Token,
    {
      ...wrappedNativeTokensList[BLOCKCHAIN_NAME.AVALANCHE],
      ...defaultTokenParams,
      image: 'assets/images/icons/default-tokens/avax.png'
    } as Token,
    {
      blockchain: BLOCKCHAIN_NAME.AVALANCHE,
      address: '0xa7d7079b0fead91f3e65f86e8915cb59c1a4c664',
      name: 'USD Coin',
      symbol: 'USDC.e',
      decimals: 6,
      image: 'assets/images/icons/default-tokens/usdc.png',
      ...defaultTokenParams
    },
    {
      blockchain: BLOCKCHAIN_NAME.AVALANCHE,
      address: '0x9702230a8ea53601f5cd2dc00fdbc13d4df4a8c7',
      name: 'TetherToken',
      symbol: 'USDt',
      decimals: 6,
      image: 'assets/images/icons/default-tokens/usdt.png',
      ...defaultTokenParams
    }
  ],
  [BLOCKCHAIN_NAME.ETHEREUM_POW]: [
    {
      ...nativeTokensList[BLOCKCHAIN_NAME.ETHEREUM_POW],
      ...defaultTokenParams,
      image: 'assets/images/icons/default-tokens/ethw.png'
    } as Token,
    {
      ...wrappedNativeTokensList[BLOCKCHAIN_NAME.ETHEREUM_POW],
      ...defaultTokenParams,
      image: 'assets/images/icons/default-tokens/weth.png'
    } as Token,
    {
      blockchain: BLOCKCHAIN_NAME.ETHEREUM_POW,
      address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
      name: 'USD Coin',
      symbol: 'USDC',
      decimals: 6,
      image: 'assets/images/icons/default-tokens/usdc.png',
      ...defaultTokenParams
    },
    {
      blockchain: BLOCKCHAIN_NAME.ETHEREUM_POW,
      address: '0xdac17f958d2ee523a2206206994597c13d831ec7',
      name: 'Tether USD',
      symbol: 'USDT',
      decimals: 6,
      image: 'assets/images/icons/default-tokens/usdt.png',
      ...defaultTokenParams
    }
  ],
  [BLOCKCHAIN_NAME.FANTOM]: [
    {
      ...nativeTokensList[BLOCKCHAIN_NAME.FANTOM],
      ...defaultTokenParams,
      image: 'assets/images/icons/default-tokens/ftm.png'
    } as Token,
    {
      ...wrappedNativeTokensList[BLOCKCHAIN_NAME.FANTOM],
      ...defaultTokenParams,
      image: 'assets/images/icons/default-tokens/wftm.png'
    } as Token,
    {
      blockchain: BLOCKCHAIN_NAME.FANTOM,
      address: '0x04068da6c83afcfa0e13ba15a6696662335d5b75',
      name: 'USD Coin',
      symbol: 'USDC',
      decimals: 6,
      image: 'assets/images/icons/default-tokens/usdc.png',
      ...defaultTokenParams
    }
  ],
  [BLOCKCHAIN_NAME.OPTIMISM]: [
    {
      ...nativeTokensList[BLOCKCHAIN_NAME.OPTIMISM],
      ...defaultTokenParams,
      image: 'assets/images/icons/default-tokens/eth.png'
    } as Token,
    {
      ...wrappedNativeTokensList[BLOCKCHAIN_NAME.OPTIMISM],
      ...defaultTokenParams,
      image: 'assets/images/icons/default-tokens/weth.png'
    } as Token,
    {
      blockchain: BLOCKCHAIN_NAME.OPTIMISM,
      address: '0x7f5c764cbc14f9669b88837ca1490cca17c31607',
      name: 'USD Coin',
      symbol: 'USDC',
      decimals: 6,
      image: 'assets/images/icons/default-tokens/usdc.png',
      ...defaultTokenParams
    },
    {
      blockchain: BLOCKCHAIN_NAME.OPTIMISM,
      address: '0x94b008aa00579c1307b0ef2c499ad98a8ce58e58',
      name: 'Tether USD',
      symbol: 'USDT',
      decimals: 6,
      image: 'assets/images/icons/default-tokens/usdt.png',
      ...defaultTokenParams
    }
  ],
  [BLOCKCHAIN_NAME.BITCOIN]: [],
  [BLOCKCHAIN_NAME.TRON]: [
    {
      ...nativeTokensList[BLOCKCHAIN_NAME.TRON],
      ...defaultTokenParams,
      image: 'assets/images/icons/default-tokens/trx.png'
    } as Token,
    {
      blockchain: BLOCKCHAIN_NAME.TRON,
      address: 'TEkxiTehnzSmSe2XqrBj4w32RUN966rdz8',
      name: 'USD Coin',
      symbol: 'USDC',
      decimals: 6,
      image: 'assets/images/icons/default-tokens/usdc.png',
      ...defaultTokenParams
    },
    {
      blockchain: BLOCKCHAIN_NAME.TRON,
      address: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t',
      name: 'Tether USD',
      symbol: 'USDT',
      decimals: 6,
      image: 'assets/images/icons/default-tokens/usdt.png',
      ...defaultTokenParams
    }
  ],
  [BLOCKCHAIN_NAME.MOONRIVER]: [
    {
      ...nativeTokensList[BLOCKCHAIN_NAME.MOONRIVER],
      ...defaultTokenParams,
      image: 'assets/images/icons/default-tokens/movr.png'
    } as Token,
    {
      ...wrappedNativeTokensList[BLOCKCHAIN_NAME.MOONRIVER],
      ...defaultTokenParams,
      image: 'assets/images/icons/default-tokens/wmovr.png'
    } as Token,
    {
      blockchain: BLOCKCHAIN_NAME.MOONRIVER,
      address: '0xe3f5a90f9cb311505cd691a46596599aa1a0ad7d',
      name: 'USD Coin',
      symbol: 'USDC',
      decimals: 6,
      image: 'assets/images/icons/default-tokens/usdc.png',
      ...defaultTokenParams
    },
    {
      blockchain: BLOCKCHAIN_NAME.MOONRIVER,
      address: '0xb44a9b6905af7c801311e8f4e76932ee959c663c',
      name: 'Tether USD',
      symbol: 'USDT',
      decimals: 6,
      image: 'assets/images/icons/default-tokens/usdt.png',
      ...defaultTokenParams
    }
  ],
  [BLOCKCHAIN_NAME.HARMONY]: [
    {
      ...nativeTokensList[BLOCKCHAIN_NAME.HARMONY],
      ...defaultTokenParams,
      image: 'assets/images/icons/default-tokens/one.png'
    } as Token,
    {
      ...wrappedNativeTokensList[BLOCKCHAIN_NAME.HARMONY],
      ...defaultTokenParams,
      image: 'assets/images/icons/default-tokens/one.png'
    } as Token,
    {
      blockchain: BLOCKCHAIN_NAME.HARMONY,
      address: '0x985458e523db3d53125813ed68c274899e9dfab4',
      name: 'USD Coin',
      symbol: '1USDC',
      decimals: 18,
      image: 'assets/images/icons/default-tokens/usdc.png',
      ...defaultTokenParams
    },
    {
      blockchain: BLOCKCHAIN_NAME.HARMONY,
      address: '0x3c2b8be99c50593081eaa2a724f0b8285f5aba8f',
      name: 'Tether USD',
      symbol: '1USDT',
      decimals: 6,
      image: 'assets/images/icons/default-tokens/usdt.png',
      ...defaultTokenParams
    }
  ],
  [BLOCKCHAIN_NAME.ARBITRUM]: [
    {
      ...nativeTokensList[BLOCKCHAIN_NAME.ARBITRUM],
      ...defaultTokenParams,
      image: 'assets/images/icons/default-tokens/eth.png'
    } as Token,
    {
      ...wrappedNativeTokensList[BLOCKCHAIN_NAME.ARBITRUM],
      ...defaultTokenParams,
      image: 'assets/images/icons/default-tokens/weth.png'
    } as Token,
    {
      blockchain: BLOCKCHAIN_NAME.ARBITRUM,
      address: '0xff970a61a04b1ca14834a43f5de4533ebddb5cc8',
      name: 'USD Coin Arb1',
      symbol: 'USDC',
      decimals: 6,
      image: 'assets/images/icons/default-tokens/usdc.png',
      ...defaultTokenParams
    },
    {
      blockchain: BLOCKCHAIN_NAME.ARBITRUM,
      address: '0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9',
      name: 'Tether USD',
      symbol: 'USDT',
      decimals: 6,
      image: 'assets/images/icons/default-tokens/usdt.png',
      ...defaultTokenParams
    }
  ],
  [BLOCKCHAIN_NAME.AURORA]: [
    {
      ...nativeTokensList[BLOCKCHAIN_NAME.AURORA],
      ...defaultTokenParams,
      image: 'assets/images/icons/default-tokens/eth.png'
    } as Token,
    {
      ...wrappedNativeTokensList[BLOCKCHAIN_NAME.AURORA],
      ...defaultTokenParams,
      image: 'assets/images/icons/default-tokens/weth.png'
    } as Token,
    {
      blockchain: BLOCKCHAIN_NAME.AURORA,
      address: '0xb12bfca5a55806aaf64e99521918a4bf0fc40802',
      name: 'usd coin',
      symbol: 'USDC',
      decimals: 6,
      image: 'assets/images/icons/default-tokens/usdc.png',
      ...defaultTokenParams
    },
    {
      blockchain: BLOCKCHAIN_NAME.AURORA,
      address: '0x4988a896b1227218e4a686fde5eabdcabd91571f',
      name: 'tetherus',
      symbol: 'USDT',
      decimals: 6,
      image: 'assets/images/icons/default-tokens/usdt.png',
      ...defaultTokenParams
    }
  ],
  [BLOCKCHAIN_NAME.TELOS]: [
    {
      ...nativeTokensList[BLOCKCHAIN_NAME.TELOS],
      ...defaultTokenParams,
      image: 'assets/images/icons/default-tokens/tlos.png'
    } as Token,
    {
      ...wrappedNativeTokensList[BLOCKCHAIN_NAME.TELOS],
      ...defaultTokenParams,
      image: 'assets/images/icons/default-tokens/tlos.png'
    } as Token,
    {
      blockchain: BLOCKCHAIN_NAME.TELOS,
      address: '0x818ec0a7fe18ff94269904fced6ae3dae6d6dc0b',
      name: 'USD Coin',
      symbol: 'USDC',
      decimals: 6,
      image: 'assets/images/icons/default-tokens/usdc.png',
      ...defaultTokenParams
    },
    {
      blockchain: BLOCKCHAIN_NAME.TELOS,
      address: '0xefaeee334f0fd1712f9a8cc375f427d9cdd40d73',
      name: 'Tether',
      symbol: 'USDT',
      decimals: 6,
      image: 'assets/images/icons/default-tokens/usdt.png',
      ...defaultTokenParams
    }
  ],
  [BLOCKCHAIN_NAME.CRONOS]: [
    {
      ...nativeTokensList[BLOCKCHAIN_NAME.CRONOS],
      ...defaultTokenParams,
      image: 'assets/images/icons/default-tokens/cro.png'
    } as Token,
    {
      ...wrappedNativeTokensList[BLOCKCHAIN_NAME.CRONOS],
      ...defaultTokenParams,
      image: 'assets/images/icons/default-tokens/wcro.png'
    } as Token,
    {
      blockchain: BLOCKCHAIN_NAME.CRONOS,
      address: '0xc21223249ca28397b4b6541dffaecc539bff0c59',
      name: 'USD Coin',
      symbol: 'USDC',
      decimals: 6,
      image: 'assets/images/icons/default-tokens/usdc.png',
      ...defaultTokenParams
    },
    {
      blockchain: BLOCKCHAIN_NAME.CRONOS,
      address: '0x66e428c3f67a68878562e79a0234c1f83c208770',
      name: 'Tether USD',
      symbol: 'USDT',
      decimals: 6,
      image: 'assets/images/icons/default-tokens/usdt.png',
      ...defaultTokenParams
    }
  ],
  [BLOCKCHAIN_NAME.GNOSIS]: [
    {
      ...nativeTokensList[BLOCKCHAIN_NAME.GNOSIS],
      ...defaultTokenParams,
      image: 'assets/images/icons/default-tokens/xdai.png'
    } as Token,
    {
      ...wrappedNativeTokensList[BLOCKCHAIN_NAME.GNOSIS],
      ...defaultTokenParams,
      image: 'assets/images/icons/default-tokens/wxdai.png'
    } as Token,
    {
      blockchain: BLOCKCHAIN_NAME.GNOSIS,
      address: '0xddafbb505ad214d7b80b1f830fccc89b60fb7a83',
      name: 'USDC on xDai',
      symbol: 'USDC',
      decimals: 6,
      image: 'assets/images/icons/default-tokens/usdc.png',
      ...defaultTokenParams
    }
  ],
  [BLOCKCHAIN_NAME.FUSE]: [
    {
      ...nativeTokensList[BLOCKCHAIN_NAME.FUSE],
      ...defaultTokenParams,
      image: 'assets/images/icons/default-tokens/fuse.png'
    } as Token,
    {
      ...wrappedNativeTokensList[BLOCKCHAIN_NAME.FUSE],
      ...defaultTokenParams,
      image: 'assets/images/icons/default-tokens/wfuse.png'
    } as Token,
    {
      blockchain: BLOCKCHAIN_NAME.FUSE,
      address: '0x620fd5fa44be6af63715ef4e65ddfa0387ad13f5',
      name: 'USD Coin on Fuse',
      symbol: 'USDC',
      decimals: 6,
      image: 'assets/images/icons/default-tokens/usdc.png',
      ...defaultTokenParams
    },
    {
      blockchain: BLOCKCHAIN_NAME.FUSE,
      address: '0xfadbbf8ce7d5b7041be672561bba99f79c532e10',
      name: 'Tether USD on Fuse',
      symbol: 'USDT',
      decimals: 6,
      image: 'assets/images/icons/default-tokens/usdt.png',
      ...defaultTokenParams
    }
  ],
  [BLOCKCHAIN_NAME.KAVA]: [
    {
      ...nativeTokensList[BLOCKCHAIN_NAME.KAVA],
      ...defaultTokenParams,
      image: 'assets/images/icons/default-tokens/kava.png'
    } as Token,
    {
      ...wrappedNativeTokensList[BLOCKCHAIN_NAME.KAVA],
      ...defaultTokenParams,
      image: 'assets/images/icons/default-tokens/kava.png'
    } as Token,
    {
      blockchain: BLOCKCHAIN_NAME.KAVA,
      address: '0xfa9343c3897324496a05fc75abed6bac29f8a40f',
      name: 'USD Coin',
      symbol: 'USDC',
      decimals: 6,
      image: 'assets/images/icons/default-tokens/usdc.png',
      ...defaultTokenParams
    },
    {
      blockchain: BLOCKCHAIN_NAME.KAVA,
      address: '0xb44a9b6905af7c801311e8f4e76932ee959c663c',
      name: 'Tether USD',
      symbol: 'USDT',
      decimals: 6,
      image: 'assets/images/icons/default-tokens/usdt.png',
      ...defaultTokenParams
    }
  ],
  [BLOCKCHAIN_NAME.MOONBEAM]: [
    {
      ...nativeTokensList[BLOCKCHAIN_NAME.MOONBEAM],
      ...defaultTokenParams,
      image: 'assets/images/icons/default-tokens/glmr.png'
    } as Token,
    {
      ...wrappedNativeTokensList[BLOCKCHAIN_NAME.MOONBEAM],
      ...defaultTokenParams,
      image: 'assets/images/icons/default-tokens/glmr.png'
    } as Token,
    {
      blockchain: BLOCKCHAIN_NAME.MOONBEAM,
      address: '0x818ec0a7fe18ff94269904fced6ae3dae6d6dc0b',
      name: 'USD Coin',
      symbol: 'USDC',
      decimals: 6,
      image: 'assets/images/icons/default-tokens/usdc.png',
      ...defaultTokenParams
    },
    {
      blockchain: BLOCKCHAIN_NAME.MOONBEAM,
      address: '0xefaeee334f0fd1712f9a8cc375f427d9cdd40d73',
      name: 'Tether USD',
      symbol: 'USDT',
      decimals: 6,
      image: 'assets/images/icons/default-tokens/usdt.png',
      ...defaultTokenParams
    }
  ],
  [BLOCKCHAIN_NAME.CELO]: [
    {
      ...nativeTokensList[BLOCKCHAIN_NAME.CELO],
      ...defaultTokenParams,
      image: 'assets/images/icons/default-tokens/celo.png'
    } as Token,
    {
      ...wrappedNativeTokensList[BLOCKCHAIN_NAME.CELO],
      ...defaultTokenParams,
      image: 'assets/images/icons/default-tokens/weth.png'
    } as Token,
    {
      blockchain: BLOCKCHAIN_NAME.CELO,
      address: '0xef4229c8c3250c675f21bcefa42f58efbff6002a',
      name: 'USD Coin',
      symbol: 'USDC',
      decimals: 6,
      image: 'assets/images/icons/default-tokens/usdc.png',
      ...defaultTokenParams
    },
    {
      blockchain: BLOCKCHAIN_NAME.CELO,
      address: '0x88eec49252c8cbc039dcdb394c0c2ba2f1637ea0',
      name: 'Tether USD',
      symbol: 'USDT',
      decimals: 6,
      image: 'assets/images/icons/default-tokens/usdt.png',
      ...defaultTokenParams
    }
  ],
  [BLOCKCHAIN_NAME.BOBA]: [
    {
      ...nativeTokensList[BLOCKCHAIN_NAME.BOBA],
      ...defaultTokenParams,
      image: 'assets/images/icons/default-tokens/eth.png'
    } as Token,
    {
      ...wrappedNativeTokensList[BLOCKCHAIN_NAME.BOBA],
      ...defaultTokenParams,
      image: 'assets/images/icons/default-tokens/weth.png'
    } as Token,
    {
      blockchain: BLOCKCHAIN_NAME.BOBA,
      address: '0x66a2a913e447d6b4bf33efbec43aaef87890fbbc',
      name: 'USD Coin',
      symbol: 'USDC',
      decimals: 6,
      image: 'assets/images/icons/default-tokens/usdc.png',
      ...defaultTokenParams
    },
    {
      blockchain: BLOCKCHAIN_NAME.BOBA,
      address: '0x5de1677344d3cb0d7d465c10b72a8f60699c062d',
      name: 'Tether USD',
      symbol: 'USDT',
      decimals: 6,
      image: 'assets/images/icons/default-tokens/usdt.png',
      ...defaultTokenParams
    }
  ],
  [BLOCKCHAIN_NAME.ASTAR]: [
    { ...nativeTokensList[BLOCKCHAIN_NAME.ASTAR], ...defaultTokenParams } as Token,
    { ...wrappedNativeTokensList[BLOCKCHAIN_NAME.ASTAR], ...defaultTokenParams } as Token,
    {
      blockchain: BLOCKCHAIN_NAME.ASTAR,
      address: '0x6a2d262d56735dba19dd70682b39f6be9a931d98',
      name: 'USD Coin',
      symbol: 'USDC',
      decimals: 6,
      image: 'assets/images/icons/default-tokens/usdc.png',
      ...defaultTokenParams
    },
    {
      blockchain: BLOCKCHAIN_NAME.ASTAR,
      address: '0x3795c36e7d12a8c252a20c5a7b455f7c57b60283',
      name: 'Tether USD',
      symbol: 'USDT',
      decimals: 6,
      image: 'assets/images/icons/default-tokens/usdt.png',
      ...defaultTokenParams
    }
  ],
  [BLOCKCHAIN_NAME.BITGERT]: [
    {
      ...nativeTokensList[BLOCKCHAIN_NAME.BITGERT],
      ...defaultTokenParams,
      image: 'assets/images/icons/default-tokens/brise.png'
    } as Token,
    {
      ...wrappedNativeTokensList[BLOCKCHAIN_NAME.BITGERT],
      ...defaultTokenParams,
      image: 'assets/images/icons/default-tokens/brise.png'
    } as Token,
    {
      blockchain: BLOCKCHAIN_NAME.BITGERT,
      address: '0x765277eebeca2e31912c9946eae1021199b39c61',
      name: 'USD Coin',
      symbol: 'USDC',
      decimals: 6,
      image: 'assets/images/icons/default-tokens/usdc.png',
      ...defaultTokenParams
    },
    {
      blockchain: BLOCKCHAIN_NAME.BITGERT,
      address: '0xe3f5a90f9cb311505cd691a46596599aa1a0ad7d',
      name: 'Tether USD',
      symbol: 'USDT',
      decimals: 6,
      image: 'assets/images/icons/default-tokens/usdt.png',
      ...defaultTokenParams
    }
  ],
  [BLOCKCHAIN_NAME.OKE_X_CHAIN]: [
    {
      ...nativeTokensList[BLOCKCHAIN_NAME.OKE_X_CHAIN],
      ...defaultTokenParams,
      image: 'assets/images/icons/default-tokens/okt.png'
    } as Token,
    {
      ...wrappedNativeTokensList[BLOCKCHAIN_NAME.OKE_X_CHAIN],
      ...defaultTokenParams,
      image: 'assets/images/icons/default-tokens/okt.png'
    } as Token,
    {
      blockchain: BLOCKCHAIN_NAME.OKE_X_CHAIN,
      address: '0xc946daf81b08146b1c7a8da2a851ddf2b3eaaf85',
      name: 'USDC',
      symbol: 'USDC',
      decimals: 18,
      image: 'assets/images/icons/default-tokens/usdc.png',
      ...defaultTokenParams
    },
    {
      blockchain: BLOCKCHAIN_NAME.OKE_X_CHAIN,
      address: '0x382bb369d343125bfb2117af9c149795c6c65c50',
      name: 'USDT',
      symbol: 'USDT',
      decimals: 18,
      image: 'assets/images/icons/default-tokens/usdt.png',
      ...defaultTokenParams
    }
  ],
  [BLOCKCHAIN_NAME.OASIS]: [
    {
      blockchain: BLOCKCHAIN_NAME.OASIS,
      address: '0xe6801928061cdbe32ac5ad0634427e140efd05f9',
      name: 'BetSwirl Token',
      symbol: 'BETS',
      decimals: 18,
      image: '',
      rank: 0.001,
      price: null
    },
    {
      blockchain: BLOCKCHAIN_NAME.OASIS,
      address: '0x65e66a61d0a8f1e686c2d6083ad611a10d84d97a',
      name: 'beefy.finance',
      symbol: 'BIFI',
      decimals: 18,
      image: '',
      rank: 0.001,
      price: null
    },
    {
      blockchain: BLOCKCHAIN_NAME.OASIS,
      address: '0xc9baa8cfdde8e328787e29b4b078abf2dadc2055',
      name: 'ChainLink Token',
      symbol: 'LINK',
      decimals: 18,
      image: '',
      rank: 0.001,
      price: null
    }
  ],
  [BLOCKCHAIN_NAME.METIS]: [
    {
      blockchain: BLOCKCHAIN_NAME.METIS,
      address: '0x80a16016cc4a2e6a2caca8a4a498b1699ff0f844',
      name: 'Avalanche',
      symbol: 'AVAX',
      decimals: 18,
      image: '',
      rank: 0.001,
      price: null
    },
    {
      blockchain: BLOCKCHAIN_NAME.METIS,
      address: '0xe3f5a90f9cb311505cd691a46596599aa1a0ad7d',
      name: 'Binance',
      symbol: 'BNB',
      decimals: 18,
      image: '',
      rank: 0.001,
      price: null
    },
    {
      blockchain: BLOCKCHAIN_NAME.METIS,
      address: '0xb44a9b6905af7c801311e8f4e76932ee959c663c',
      name: 'Matic',
      symbol: 'MATIC',
      decimals: 18,
      image: '',
      rank: 0.001,
      price: null
    }
  ],
  [BLOCKCHAIN_NAME.SOLANA]: [
    { ...nativeTokensList[BLOCKCHAIN_NAME.SOLANA], ...defaultTokenParams } as Token,
    { ...wrappedNativeTokensList[BLOCKCHAIN_NAME.SOLANA], ...defaultTokenParams } as Token
  ],
  [BLOCKCHAIN_NAME.NEAR]: [
    { ...nativeTokensList[BLOCKCHAIN_NAME.SOLANA], ...defaultTokenParams } as Token,
    { ...wrappedNativeTokensList[BLOCKCHAIN_NAME.SOLANA], ...defaultTokenParams } as Token
  ],
  [BLOCKCHAIN_NAME.DFK]: [
    {
      blockchain: BLOCKCHAIN_NAME.DFK,
      address: '0x0000000000000000000000000000000000000000',
      name: 'JEWEL',
      symbol: 'JEWEL',
      decimals: 18,
      image: '',
      rank: 0.001,
      price: null
    },
    {
      blockchain: BLOCKCHAIN_NAME.DFK,
      address: '0xCCb93dABD71c8Dad03Fc4CE5559dC3D89F67a260',
      name: 'Wrapped JEWEL',
      symbol: 'WJEWEL',
      decimals: 18,
      image: '',
      rank: 0.001,
      price: null
    }
  ]
};
