/* eslint-disable @typescript-eslint/no-explicit-any */
import { BLOCKCHAIN_NAME } from 'rubic-sdk';
import { AbiItem } from 'web3-utils';

export const symbiosisPools: any = {
  [BLOCKCHAIN_NAME.ETHEREUM]: {
    [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: {
      address: '0xab0738320A21741f12797Ee921461C691673E276',
      // tokens: [
      //   '0xA7D7079b0FEaD91F3e65f86E8915Cb59c1a4C664',
      //   '0x2f28Add68e59733D23D5F57d94c31fb965f835D0'
      // ],
      decimals: [6, 6]
    },
    [BLOCKCHAIN_NAME.AVALANCHE]: {
      address: '0xab0738320A21741f12797Ee921461C691673E276',
      // tokens: [
      //   '0xA7D7079b0FEaD91F3e65f86E8915Cb59c1a4C664',
      //   '0x2f28Add68e59733D23D5F57d94c31fb965f835D0'
      // ],
      decimals: [6, 6]
    },
    [BLOCKCHAIN_NAME.POLYGON]: {
      address: '0xab0738320A21741f12797Ee921461C691673E276',
      // tokens: [
      //   '0x66a2A913e447d6b4BF33EFbec43aAeF87890FBbc',
      //   '0x2f28Add68e59733D23D5F57d94c31fb965f835D0'
      // ],
      decimals: [6, 6]
    },
    [BLOCKCHAIN_NAME.BOBA]: {
      address: '0xab0738320A21741f12797Ee921461C691673E276',
      // tokens: [
      //   '0x66a2A913e447d6b4BF33EFbec43aAeF87890FBbc',
      //   '0x2f28Add68e59733D23D5F57d94c31fb965f835D0'
      // ],
      decimals: [6, 6]
    }
  },
  [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: {
    [BLOCKCHAIN_NAME.AVALANCHE]: {
      address: '0xF4BFF06E02cdF55918e0ec98082bDE1DA85d33Db',
      tokens: [
        '0xA7D7079b0FEaD91F3e65f86E8915Cb59c1a4C664',
        '0xf04d3A8Eb17B832Fbebf43610e94BdC4fD5Cf2dd'
      ],
      decimals: [6, 18]
    },
    [BLOCKCHAIN_NAME.POLYGON]: {
      address: '0xF4BFF06E02cdF55918e0ec98082bDE1DA85d33Db',
      tokens: [
        '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
        '0xf04d3A8Eb17B832Fbebf43610e94BdC4fD5Cf2dd'
      ],
      decimals: [6, 18]
    },
    [BLOCKCHAIN_NAME.AURORA]: {
      address: '0x7Ff7AdE2A214F9A4634bBAA4E870A5125dA521B8',
      tokens: [
        '0xB12BFcA5A55806AaF64E99521918A4bf0fC40802',
        '0xd5e98CAeb396daBE5a102bB9256B552944e3401f'
      ],
      decimals: [6, 18]
    },
    [BLOCKCHAIN_NAME.TELOS]: {
      address: '0x7f3C1E54b8b8C7c08b02f0da820717fb641F26C8',
      tokens: [
        '0x818ec0a7fe18ff94269904fced6ae3dae6d6dc0b',
        '0x017043607270ECbB440e20b0f0BC5E760818b3d8'
      ],
      decimals: [6, 18]
    },
    [BLOCKCHAIN_NAME.BOBA]: {
      address: '0xe0ddd7afC724BD4B320472B5C954c0abF8192344',
      tokens: [
        '0x66a2A913e447d6b4BF33EFbec43aAeF87890FBbc',
        '0xf04d3A8Eb17B832Fbebf43610e94BdC4fD5Cf2dd'
      ],
      decimals: [6, 18]
    }
  },
  [BLOCKCHAIN_NAME.POLYGON]: {
    [BLOCKCHAIN_NAME.AURORA]: {
      address: '0x7F1245B61Ba0b7D4C41f28cAc9F8637fc6Bec9E4',
      tokens: [
        '0xB12BFcA5A55806AaF64E99521918A4bf0fC40802',
        '0x42Cc1CBf253F89bE6814a0f59F745b40b69b6220'
      ],
      decimals: [6, 6]
    }
  },
  [BLOCKCHAIN_NAME.AVALANCHE]: {
    [BLOCKCHAIN_NAME.POLYGON]: {
      address: '0x3F1bfa6FA3B6D03202538Bf0cdE92BbE551104ac',
      tokens: [
        '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
        '0x8Eb3771A43a8C45AaBE6d61ED709eCe652281DC9'
      ],
      decimals: [6, 6]
    }
  },
  [BLOCKCHAIN_NAME.AURORA]: {},
  [BLOCKCHAIN_NAME.BOBA]: {},
  [BLOCKCHAIN_NAME.TELOS]: {}
};

export const config = {
  chains: [
    {
      id: 1,
      rpc: 'https://rpc.ankr.com/eth',
      filterBlockOffset: 3000,
      waitForBlocksCount: 5,
      stables: [
        {
          name: 'USD Coin',
          address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
          symbol: 'USDC',
          decimals: 6,
          chainId: 1,
          isStable: true,
          icons: {
            large:
              'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png',
            small:
              'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png'
          }
        }
      ]
    },
    {
      id: 56,
      rpc: 'https://rpc.ankr.com/bsc',
      filterBlockOffset: 3000,
      waitForBlocksCount: 20,
      stables: [
        {
          name: 'Binance USD',
          address: '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56',
          symbol: 'BUSD',
          decimals: 18,
          chainId: 56,
          isStable: true,
          icons: {
            large:
              'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/binance/assets/BUSD-BD1/logo.png',
            small:
              'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/binance/assets/BUSD-BD1/logo.png'
          }
        },
        {
          name: 'Synthetic USDC',
          address: '0x2f28Add68e59733D23D5F57d94c31fb965f835D0',
          symbol: 'sUSDC',
          decimals: 6,
          chainId: 56,
          chainFromId: 1,
          isStable: true,
          icons: {
            large:
              'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png',
            small:
              'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png'
          }
        }
      ],
      nerves: [
        {
          address: '0xab0738320A21741f12797Ee921461C691673E276',
          tokens: [
            '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56',
            '0x2f28Add68e59733D23D5F57d94c31fb965f835D0'
          ],
          decimals: [18, 6]
        }
      ]
    },
    {
      id: 43114,
      rpc: 'https://rpc.ankr.com/avalanche',
      filterBlockOffset: 3000,
      waitForBlocksCount: 30,
      stables: [
        {
          name: 'USD Coin',
          address: '0xA7D7079b0FEaD91F3e65f86E8915Cb59c1a4C664',
          symbol: 'USDC.e',
          decimals: 6,
          chainId: 43114,
          isStable: true,
          icons: {
            large:
              'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png',
            small:
              'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png'
          }
        },
        {
          name: 'Synthetic USDC',
          address: '0x2f28Add68e59733D23D5F57d94c31fb965f835D0',
          symbol: 'sUSDC',
          decimals: 6,
          chainId: 43114,
          chainFromId: 1,
          isStable: true,
          icons: {
            large:
              'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png',
            small:
              'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png'
          }
        },
        {
          name: 'Synthetic BUSD',
          address: '0xf04d3A8Eb17B832Fbebf43610e94BdC4fD5Cf2dd',
          symbol: 'sBUSD',
          decimals: 18,
          chainId: 43114,
          chainFromId: 56,
          isStable: true,
          icons: {
            large:
              'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/binance/assets/BUSD-BD1/logo.png',
            small:
              'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/binance/assets/BUSD-BD1/logo.png'
          }
        }
      ],
      nerves: [
        {
          address: '0xab0738320A21741f12797Ee921461C691673E276',
          tokens: [
            '0xA7D7079b0FEaD91F3e65f86E8915Cb59c1a4C664',
            '0x2f28Add68e59733D23D5F57d94c31fb965f835D0'
          ],
          decimals: [6, 6]
        },
        {
          address: '0xF4BFF06E02cdF55918e0ec98082bDE1DA85d33Db',
          tokens: [
            '0xA7D7079b0FEaD91F3e65f86E8915Cb59c1a4C664',
            '0xf04d3A8Eb17B832Fbebf43610e94BdC4fD5Cf2dd'
          ],
          decimals: [6, 18]
        }
      ]
    },
    {
      id: 137,
      rpc: 'https://rpc.ankr.com/polygon',
      filterBlockOffset: 3000,
      waitForBlocksCount: 60,
      stables: [
        {
          name: 'USD Coin',
          address: '0x2791bca1f2de4661ed88a30c99a7a9449aa84174',
          symbol: 'USDC',
          isStable: true,
          decimals: 6,
          chainId: 137,
          icons: {
            large:
              'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png',
            small:
              'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png'
          }
        },
        {
          name: 'Synthetic USDC',
          symbol: 'sUSDC',
          address: '0x2f28Add68e59733D23D5F57d94c31fb965f835D0',
          chainId: 137,
          chainFromId: 1,
          decimals: 6,
          isStable: true,
          icons: {
            large:
              'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png',
            small:
              'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png'
          }
        },
        {
          name: 'Synthetic BUSD',
          symbol: 'sBUSD',
          address: '0xf04d3A8Eb17B832Fbebf43610e94BdC4fD5Cf2dd',
          chainId: 137,
          chainFromId: 56,
          decimals: 18,
          isStable: true,
          icons: {
            large:
              'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/binance/assets/BUSD-BD1/logo.png',
            small:
              'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/binance/assets/BUSD-BD1/logo.png'
          }
        },
        {
          name: 'Synthetic USDC.e',
          symbol: 'sUSDC.e',
          address: '0x8Eb3771A43a8C45AaBE6d61ED709eCe652281DC9',
          chainId: 137,
          chainFromId: 43114,
          decimals: 6,
          isStable: true,
          icons: {
            large:
              'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png',
            small:
              'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png'
          }
        }
      ],
      nerves: [
        {
          address: '0xab0738320A21741f12797Ee921461C691673E276',
          tokens: [
            '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
            '0x2f28Add68e59733D23D5F57d94c31fb965f835D0'
          ],
          decimals: [6, 6]
        },
        {
          address: '0xF4BFF06E02cdF55918e0ec98082bDE1DA85d33Db',
          tokens: [
            '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
            '0xf04d3A8Eb17B832Fbebf43610e94BdC4fD5Cf2dd'
          ],
          decimals: [6, 18]
        },
        {
          address: '0x3F1bfa6FA3B6D03202538Bf0cdE92BbE551104ac',
          tokens: [
            '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
            '0x8Eb3771A43a8C45AaBE6d61ED709eCe652281DC9'
          ],
          decimals: [6, 6]
        }
      ]
    },
    {
      id: 288,
      rpc: 'https://mainnet.boba.network',
      filterBlockOffset: 4900,
      waitForBlocksCount: 0,
      stables: [
        {
          name: 'USD Coin',
          address: '0x66a2A913e447d6b4BF33EFbec43aAeF87890FBbc',
          symbol: 'USDC',
          decimals: 6,
          chainId: 288,
          isStable: true,
          icons: {
            large:
              'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png',
            small:
              'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png'
          }
        },
        {
          name: 'Synthetic USDC',
          address: '0x2f28Add68e59733D23D5F57d94c31fb965f835D0',
          symbol: 'sUSDC',
          decimals: 6,
          chainId: 288,
          chainFromId: 1,
          isStable: true,
          icons: {
            large:
              'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png',
            small:
              'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png'
          }
        },
        {
          name: 'Synthetic BUSD',
          address: '0xf04d3A8Eb17B832Fbebf43610e94BdC4fD5Cf2dd',
          symbol: 'sBUSD',
          decimals: 18,
          chainId: 288,
          chainFromId: 56,
          isStable: true,
          icons: {
            large:
              'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/binance/assets/BUSD-BD1/logo.png',
            small:
              'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/binance/assets/BUSD-BD1/logo.png'
          }
        }
      ],
      nerves: [
        {
          address: '0xab0738320A21741f12797Ee921461C691673E276',
          tokens: [
            '0x66a2A913e447d6b4BF33EFbec43aAeF87890FBbc',
            '0x2f28Add68e59733D23D5F57d94c31fb965f835D0'
          ],
          decimals: [6, 6]
        },
        {
          address: '0xe0ddd7afC724BD4B320472B5C954c0abF8192344',
          tokens: [
            '0x66a2A913e447d6b4BF33EFbec43aAeF87890FBbc',
            '0xf04d3A8Eb17B832Fbebf43610e94BdC4fD5Cf2dd'
          ],
          decimals: [6, 18]
        }
      ]
    },
    {
      id: 2001,
      rpc: 'https://rpc-mainnet-cardano-evm.c1.milkomeda.com',
      filterBlockOffset: 4900,
      waitForBlocksCount: 0,
      stables: [
        {
          name: 'USDC from Ethereum',
          address: '0x42110A5133F91B49E32B671Db86E2C44Edc13832',
          symbol: 'sUSDC',
          decimals: 6,
          chainId: 2001,
          isStable: true,
          chainFromId: 1,
          icons: {
            large:
              'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png',
            small:
              'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png'
          }
        }
      ]
    },
    {
      id: 1313161554,
      rpc: 'https://mainnet.aurora.dev',
      filterBlockOffset: 4900,
      waitForBlocksCount: 60,
      stables: [
        {
          name: 'USD Coin',
          address: '0xB12BFcA5A55806AaF64E99521918A4bf0fC40802',
          symbol: 'USDC',
          decimals: 6,
          chainId: 1313161554,
          isStable: true,
          icons: {
            large: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3408.png',
            small: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3408.png'
          }
        },
        {
          name: 'Synthetic BUSD',
          address: '0xd5e98CAeb396daBE5a102bB9256B552944e3401f',
          symbol: 'sBUSD',
          decimals: 18,
          chainId: 1313161554,
          chainFromId: 56,
          isStable: true,
          icons: {
            large: 'https://s2.coinmarketcap.com/static/img/coins/64x64/4687.png',
            small: 'https://s2.coinmarketcap.com/static/img/coins/64x64/4687.png'
          }
        },
        {
          name: 'Synthetic USDC',
          address: '0x42Cc1CBf253F89bE6814a0f59F745b40b69b6220',
          symbol: 'sUSDC',
          decimals: 6,
          chainId: 1313161554,
          chainFromId: 137,
          isStable: true,
          icons: {
            large: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3408.png',
            small: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3408.png'
          }
        }
      ],
      nerves: [
        {
          address: '0x7Ff7AdE2A214F9A4634bBAA4E870A5125dA521B8',
          tokens: [
            '0xB12BFcA5A55806AaF64E99521918A4bf0fC40802',
            '0xd5e98CAeb396daBE5a102bB9256B552944e3401f'
          ],
          decimals: [6, 18]
        },
        {
          address: '0x7F1245B61Ba0b7D4C41f28cAc9F8637fc6Bec9E4',
          tokens: [
            '0xB12BFcA5A55806AaF64E99521918A4bf0fC40802',
            '0x42Cc1CBf253F89bE6814a0f59F745b40b69b6220'
          ],
          decimals: [6, 6]
        }
      ]
    },
    {
      id: 40,
      rpc: 'https://mainnet.telos.net/evm',
      filterBlockOffset: 4900,
      waitForBlocksCount: 120,
      stables: [
        {
          name: 'USDC',
          symbol: 'USDC',
          address: '0x818ec0a7fe18ff94269904fced6ae3dae6d6dc0b',
          chainId: 40,
          decimals: 6,
          isStable: true,
          icons: {
            large: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3408.png',
            small: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3408.png'
          }
        },
        {
          name: 'Synthetic BUSD',
          symbol: 'sBUSD',
          address: '0x017043607270ECbB440e20b0f0BC5E760818b3d8',
          chainId: 40,
          chainFromId: 56,
          decimals: 18,
          isStable: true,
          icons: {
            large: 'https://s2.coinmarketcap.com/static/img/coins/64x64/4687.png',
            small: 'https://s2.coinmarketcap.com/static/img/coins/64x64/4687.png'
          }
        }
      ],
      nerves: [
        {
          address: '0x7f3C1E54b8b8C7c08b02f0da820717fb641F26C8',
          tokens: [
            '0x818ec0a7fe18ff94269904fced6ae3dae6d6dc0b',
            '0x017043607270ECbB440e20b0f0BC5E760818b3d8'
          ],
          decimals: [6, 18]
        }
      ]
    }
  ]
};

export const symbiosisPoolAbi = [
  {
    inputs: [{ internalType: 'uint8', name: 'index', type: 'uint8' }],
    name: 'getToken',
    outputs: [{ internalType: 'contract IERC20', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'uint8', name: 'index', type: 'uint8' }],
    name: 'getTokenBalance',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  }
] as AbiItem[];
