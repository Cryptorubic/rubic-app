export const SYMBIOSIS_CONFIG = {
  minSwapAmountInUsd: 10,
  maxSwapAmountInUsd: 5000000,
  advisor: {
    url: 'https://api.symbiosis.finance/calculations'
  },
  chains: [
    {
      id: 1,
      rpc: 'https://eth.getblock.io/mainnet/?api_key=02530958-c8c4-4297-974c-66203e79800d',
      filterBlockOffset: 100000,
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
      ],
      nerves: [],
      router: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
      dexFee: 30,
      metaRouter: '0xB9E13785127BFfCc3dc970A55F6c7bF0844a3C15',
      metaRouterGateway: '0x03B7551EB0162c838a10c2437b60D1f5455b9554',
      bridge: '0xd5F0f8dB993D26F5df89E70a83d32b369DcCdaa0',
      synthesis: '0x0000000000000000000000000000000000000000',
      portal: '0xb80fDAA74dDA763a8A158ba85798d373A5E84d84',
      fabric: '0x0000000000000000000000000000000000000000',
      multicallRouter: '0x49d3Fc00f3ACf80FABCb42D7681667B20F60889A',
      aavePool: '0x0000000000000000000000000000000000000000',
      aavePoolDataProvider: '0x0000000000000000000000000000000000000000',
      creamComptroller: '0x3d5BC3c8d13dcB8bF317092d84783c2697AE9258',
      blocksPerYear: 2336000
    },
    {
      id: 56,
      rpc: 'https://bsc.getblock.io/mainnet/?api_key=02530958-c8c4-4297-974c-66203e79800d',
      filterBlockOffset: 100000,
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
      ],
      router: '0x10ED43C718714eb63d5aA57B78B54704E256024E',
      dexFee: 25,
      metaRouter: '0x8D602356c7A6220CDE24BDfB4AB63EBFcb0a9b5d',
      metaRouterGateway: '0xe2faC824615538C3A9ae704c75582cD1AbdD7cdf',
      bridge: '0xd5F0f8dB993D26F5df89E70a83d32b369DcCdaa0',
      synthesis: '0xb80fDAA74dDA763a8A158ba85798d373A5E84d84',
      portal: '0xD7F9989bE0d15319d13d6FA5d468211C89F0b147',
      fabric: '0x947a0d452b40013190295a4151A090E1638Fb848',
      multicallRouter: '0x44b5d0F16Ad55c4e7113310614745e8771b963bB',
      aavePool: '0x0000000000000000000000000000000000000000',
      aavePoolDataProvider: '0x0000000000000000000000000000000000000000',
      creamComptroller: '0x589de0f0ccf905477646599bb3e5c622c84cc0ba',
      blocksPerYear: 10512000
    },
    {
      id: 43114,
      rpc: 'https://speedy-nodes-nyc.moralis.io/7625ae299d1e13d495412740/avalanche/mainnet',
      filterBlockOffset: 100000,
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
      ],
      router: '0xE54Ca86531e17Ef3616d22Ca28b0D458b6C89106',
      dexFee: 30,
      metaRouter: '0xE5E68630B5B759e6C701B70892AA8324b71e6e20',
      metaRouterGateway: '0x25821A21C2E3455967229cADCA9b6fdd4A80a40b',
      bridge: '0xd5F0f8dB993D26F5df89E70a83d32b369DcCdaa0',
      synthesis: '0xb80fDAA74dDA763a8A158ba85798d373A5E84d84',
      portal: '0xD7F9989bE0d15319d13d6FA5d468211C89F0b147',
      fabric: '0x947a0d452b40013190295a4151A090E1638Fb848',
      multicallRouter: '0xDc9a6a26209A450caC415fb78487e907c660cf6a',
      aavePool: '0x794a61358D6845594F94dc1DB02A252b5b4814aD',
      aavePoolDataProvider: '0x69FA688f1Dc47d4B5d8029D5a35FB7a548310654',
      creamComptroller: '0x0000000000000000000000000000000000000000',
      blocksPerYear: 10512000
    },
    {
      id: 137,
      rpc: 'https://matic.getblock.io/mainnet/?api_key=02530958-c8c4-4297-974c-66203e79800d',
      filterBlockOffset: 100000,
      waitForBlocksCount: 60,
      stables: [
        {
          name: 'USD Coin',
          address: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
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
      ],
      router: '0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff',
      dexFee: 30,
      metaRouter: '0x733D33FA01424F83E9C095af3Ece80Ed6fa565F1',
      metaRouterGateway: '0xF3273BD35e4Ad4fcd49DabDee33582b41Cbb9d77',
      bridge: '0xd5F0f8dB993D26F5df89E70a83d32b369DcCdaa0',
      synthesis: '0xb80fDAA74dDA763a8A158ba85798d373A5E84d84',
      portal: '0xD7F9989bE0d15319d13d6FA5d468211C89F0b147',
      fabric: '0x947a0d452b40013190295a4151A090E1638Fb848',
      multicallRouter: '0xc5B61b9abC3C6229065cAD0e961aF585C5E0135c',
      aavePool: '0x794a61358D6845594F94dc1DB02A252b5b4814aD',
      aavePoolDataProvider: '0x69FA688f1Dc47d4B5d8029D5a35FB7a548310654',
      creamComptroller: '0x20CA53E2395FA571798623F1cFBD11Fe2C114c24',
      blocksPerYear: 15768000
    }
  ]
};
