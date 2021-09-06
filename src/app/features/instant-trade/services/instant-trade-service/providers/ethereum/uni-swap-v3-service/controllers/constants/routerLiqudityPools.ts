import { LiquidityPool } from 'src/app/features/instant-trade/services/instant-trade-service/providers/ethereum/uni-swap-v3-service/controllers/models/LiquidityPool';

export const routerTokensWithMode = {
  mainnet: {
    WETH: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
    USDT: '0xdac17f958d2ee523a2206206994597c13d831ec7',
    USDC: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
    WBTC: '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599',
    DAI: '0x6b175474e89094c44da98b954eedeac495271d0f'
  },
  testnet: {
    WETH: '0xd0a1e359811322d97991e03f863a0c30c2cf029c',
    WEENUS: '0xaFF4481D10270F50f203E0763e2597776068CBc5',
    XEENUS: '0x022e292b44b5a146f2e8ee36ff44d3dd863c915c'
  }
};

const mainnetRouterTokens = routerTokensWithMode.mainnet;
const testnetRouterTokens = routerTokensWithMode.testnet;

export const routerLiquidityPoolsWithMode: {
  mainnet: LiquidityPool[];
  testnet: LiquidityPool[];
} = {
  mainnet: [
    {
      address: '0x8ad599c3A0ff1De082011EFDDc58f1908eb6e6D8',
      token0: mainnetRouterTokens.USDC,
      token1: mainnetRouterTokens.WETH,
      fee: 3000
    },
    {
      address: '0x7858E59e0C01EA06Df3aF3D20aC7B0003275D4Bf',
      token0: mainnetRouterTokens.USDC,
      token1: mainnetRouterTokens.USDT,
      fee: 500
    },
    {
      address: '0xCBCdF9626bC03E24f779434178A73a0B4bad62eD',
      token0: mainnetRouterTokens.WBTC,
      token1: mainnetRouterTokens.WETH,
      fee: 3000
    },
    {
      address: '0x4e68Ccd3E89f51C3074ca5072bbAC773960dFa36',
      token0: mainnetRouterTokens.WETH,
      token1: mainnetRouterTokens.USDT,
      fee: 3000
    },
    {
      address: '0x6c6Bc977E13Df9b0de53b251522280BB72383700',
      token0: mainnetRouterTokens.DAI,
      token1: mainnetRouterTokens.USDC,
      fee: 500
    },
    {
      address: '0x88e6A0c2dDD26FEEb64F039a2c41296FcB3f5640',
      token0: mainnetRouterTokens.USDC,
      token1: mainnetRouterTokens.WETH,
      fee: 500
    }
  ],
  testnet: [
    {
      address: '0x44e0B6E92796B2b87535C1272592cC7E8927460D',
      token0: testnetRouterTokens.WEENUS,
      token1: testnetRouterTokens.WETH,
      fee: 3000
    },
    {
      address: '0x6492b8262251477EAd7e3fF05F922a853699E159',
      token0: testnetRouterTokens.XEENUS,
      token1: testnetRouterTokens.WETH,
      fee: 3000
    },
    {
      address: '0x7623e43DD003361a4AD870217F5168F9128024e3',
      token0: testnetRouterTokens.WEENUS,
      token1: testnetRouterTokens.WETH,
      fee: 10000
    },
    {
      address: '0x6D6d9609bb827fE6253F1C6c75C76C5Cd12B8773',
      token0: testnetRouterTokens.XEENUS,
      token1: testnetRouterTokens.WETH,
      fee: 500
    },
    {
      address: '0xd023579d5a7C1015D2c6999566aff23248255088',
      token0: testnetRouterTokens.XEENUS,
      token1: testnetRouterTokens.WEENUS,
      fee: 3000
    }
  ]
};
