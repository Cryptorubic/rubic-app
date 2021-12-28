import { LiquidityPool } from '@features/instant-trade/services/instant-trade-service/providers/ethereum/uni-swap-v3-service/utils/quoter-controller/models/liquidity-pool';
import { NetMode } from '@shared/models/blockchain/net-mode';
import { SymbolToken } from '@shared/models/tokens/symbol-token';

/**
 * Most popular tokens in uni v3 to use in a route.
 */
export const routerTokensNetMode: Record<NetMode, Record<string, SymbolToken>> = {
  mainnet: {
    WETH: { address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', symbol: 'WETH' },
    USDT: { address: '0xdac17f958d2ee523a2206206994597c13d831ec7', symbol: 'USDT' },
    USDC: { address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', symbol: 'USDC' },
    WBTC: { address: '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599', symbol: 'WBTC' },
    DAI: { address: '0x6b175474e89094c44da98b954eedeac495271d0f', symbol: 'DAI' }
  },
  testnet: {
    WETH: { address: '0xd0a1e359811322d97991e03f863a0c30c2cf029c', symbol: 'WETH' },
    WEENUS: { address: '0xaFF4481D10270F50f203E0763e2597776068CBc5', symbol: 'WEENUS' },
    XEENUS: { address: '0x022e292b44b5a146f2e8ee36ff44d3dd863c915c', symbol: 'XEENUS' }
  }
};

const mainnetRouterTokens = routerTokensNetMode.mainnet;
const testnetRouterTokens = routerTokensNetMode.testnet;

/**
 * Most popular liquidity pools in uni v3 to use in a route.
 */
export const routerLiquidityPoolsWithMode: Record<NetMode, LiquidityPool[]> = {
  mainnet: [
    new LiquidityPool(
      '0x8ad599c3A0ff1De082011EFDDc58f1908eb6e6D8',
      mainnetRouterTokens.USDC,
      mainnetRouterTokens.WETH,
      3000
    ),
    new LiquidityPool(
      '0x7858E59e0C01EA06Df3aF3D20aC7B0003275D4Bf',
      mainnetRouterTokens.USDC,
      mainnetRouterTokens.USDT,
      500
    ),
    new LiquidityPool(
      '0xCBCdF9626bC03E24f779434178A73a0B4bad62eD',
      mainnetRouterTokens.WBTC,
      mainnetRouterTokens.WETH,
      3000
    ),
    new LiquidityPool(
      '0x4e68Ccd3E89f51C3074ca5072bbAC773960dFa36',
      mainnetRouterTokens.WETH,
      mainnetRouterTokens.USDT,
      3000
    ),
    new LiquidityPool(
      '0x6c6Bc977E13Df9b0de53b251522280BB72383700',
      mainnetRouterTokens.DAI,
      mainnetRouterTokens.USDC,
      500
    ),
    new LiquidityPool(
      '0x88e6A0c2dDD26FEEb64F039a2c41296FcB3f5640',
      mainnetRouterTokens.USDC,
      mainnetRouterTokens.WETH,
      500
    )
  ],
  testnet: [
    new LiquidityPool(
      '0x44e0B6E92796B2b87535C1272592cC7E8927460D',
      testnetRouterTokens.WEENUS,
      testnetRouterTokens.WETH,
      3000
    ),
    new LiquidityPool(
      '0x6492b8262251477EAd7e3fF05F922a853699E159',
      testnetRouterTokens.XEENUS,
      testnetRouterTokens.WETH,
      3000
    ),
    new LiquidityPool(
      '0x7623e43DD003361a4AD870217F5168F9128024e3',
      testnetRouterTokens.WEENUS,
      testnetRouterTokens.WETH,
      10000
    ),
    new LiquidityPool(
      '0x6D6d9609bb827fE6253F1C6c75C76C5Cd12B8773',
      testnetRouterTokens.XEENUS,
      testnetRouterTokens.WETH,
      500
    ),
    new LiquidityPool(
      '0xd023579d5a7C1015D2c6999566aff23248255088',
      testnetRouterTokens.XEENUS,
      testnetRouterTokens.WEENUS,
      3000
    )
  ]
};
