export const config = {
  minSwapAmountInUsd: 10,
  maxSwapAmountInUsd: 5000000,
  advisor: {
    url: 'https://api.symbiosis.finance/calculations'
  },
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
      creamComptroller: '0x3d5BC3c8d13dcB8bF317092d84783c2697AE9258',
      renGatewayRegistry: '0x0000000000000000000000000000000000000000'
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
      creamComptroller: '0x589de0f0ccf905477646599bb3e5c622c84cc0ba',
      renGatewayRegistry: '0xf36666C230Fa12333579b9Bd6196CB634D6BC506'
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
      creamComptroller: '0x486Af39519B4Dc9a7fCcd318217352830E8AD9b4',
      renGatewayRegistry: '0x0000000000000000000000000000000000000000'
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
      creamComptroller: '0x20CA53E2395FA571798623F1cFBD11Fe2C114c24',
      renGatewayRegistry: '0xf36666C230Fa12333579b9Bd6196CB634D6BC506'
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
      ],
      router: '0x17C83E2B96ACfb5190d63F5E46d93c107eC0b514',
      dexFee: 30,
      metaRouter: '0xd2B5945829D8254C40f63f476C9F02CF5762F8DF',
      metaRouterGateway: '0x5ee04643fe2D63f364F77B38C41F15A54930f5C1',
      bridge: '0xd5F0f8dB993D26F5df89E70a83d32b369DcCdaa0',
      synthesis: '0xb80fDAA74dDA763a8A158ba85798d373A5E84d84',
      portal: '0xD7F9989bE0d15319d13d6FA5d468211C89F0b147',
      fabric: '0x947a0d452b40013190295a4151A090E1638Fb848',
      multicallRouter: '0x506803495B1876FE1fA6Cd9dC65fB060057A4Cc3',
      aavePool: '0x0000000000000000000000000000000000000000',
      creamComptroller: '0x0000000000000000000000000000000000000000',
      renGatewayRegistry: '0x0000000000000000000000000000000000000000'
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
      ],
      nerves: [],
      router: '0x9CdcE24c0e67611B698E6C228BF7791D4ECc553A',
      dexFee: 30,
      metaRouter: '0xc2299c4a45b7e44fFC23e6ba7aAC4AeFF0DDbccC',
      metaRouterGateway: '0xcB9ec7Bfa69c400F97fD667Bf3D8C61359cf50c2',
      bridge: '0xd5F0f8dB993D26F5df89E70a83d32b369DcCdaa0',
      synthesis: '0x47E70310b17f97f3bd5F2536854E3ccEc4A98295',
      portal: '0x3Cd5343546837B958a70B82E3F9a0E857d0b5fea',
      fabric: '0x17A0E3234f00b9D7028e2c78dB2caa777F11490F',
      multicallRouter: '0xcB28fbE3E9C0FEA62E0E63ff3f232CECfE555aD4',
      aavePool: '0x0000000000000000000000000000000000000000',
      creamComptroller: '0x0000000000000000000000000000000000000000',
      renGatewayRegistry: '0x0000000000000000000000000000000000000000'
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
      ],
      router: '0x2CB45Edb4517d5947aFdE3BEAbF95A582506858B',
      dexFee: 30,
      metaRouter: '0xc2299c4a45b7e44fFC23e6ba7aAC4AeFF0DDbccC',
      metaRouterGateway: '0xcB9ec7Bfa69c400F97fD667Bf3D8C61359cf50c2',
      bridge: '0xd5F0f8dB993D26F5df89E70a83d32b369DcCdaa0',
      synthesis: '0x47E70310b17f97f3bd5F2536854E3ccEc4A98295',
      portal: '0x17A0E3234f00b9D7028e2c78dB2caa777F11490F',
      fabric: '0x310F5991c627b55a6CDd53dD01f70E15f7c249F3',
      multicallRouter: '0xcB28fbE3E9C0FEA62E0E63ff3f232CECfE555aD4',
      aavePool: '0x0000000000000000000000000000000000000000',
      creamComptroller: '0x0000000000000000000000000000000000000000',
      renGatewayRegistry: '0x0000000000000000000000000000000000000000'
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
      ],
      router: '0xf9678db1ce83f6f51e5df348e2cc842ca51efec1',
      dexFee: 25,
      metaRouter: '0xc2299c4a45b7e44fFC23e6ba7aAC4AeFF0DDbccC',
      metaRouterGateway: '0xcB9ec7Bfa69c400F97fD667Bf3D8C61359cf50c2',
      bridge: '0xd5F0f8dB993D26F5df89E70a83d32b369DcCdaa0',
      synthesis: '0x47E70310b17f97f3bd5F2536854E3ccEc4A98295',
      portal: '0x17A0E3234f00b9D7028e2c78dB2caa777F11490F',
      fabric: '0x310F5991c627b55a6CDd53dD01f70E15f7c249F3',
      multicallRouter: '0xcB28fbE3E9C0FEA62E0E63ff3f232CECfE555aD4',
      aavePool: '0x0000000000000000000000000000000000000000',
      creamComptroller: '0x0000000000000000000000000000000000000000',
      renGatewayRegistry: '0x0000000000000000000000000000000000000000'
    }
  ]
};
