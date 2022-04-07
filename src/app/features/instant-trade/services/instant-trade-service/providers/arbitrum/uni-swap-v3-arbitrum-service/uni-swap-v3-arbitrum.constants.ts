import { BLOCKCHAIN_NAME } from '@shared/models/blockchain/blockchain-name';
import { UniswapV3Constants } from '@features/instant-trade/services/instant-trade-service/providers/common/uniswap-v3/models/uniswap-v3-constants';
import { LiquidityPool } from '@features/instant-trade/services/instant-trade-service/providers/common/uniswap-v3/utils/quoter-controller/models/liquidity-pool';

const wethAddress = '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1';

/**
 * Most popular tokens in uni v3 to use in a route.
 */
const routerTokens = {
  WETH: { address: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1', symbol: 'WETH' },
  GMX: { address: '0xfc5A1A6EB076a2C7aD06eD22C90d7E710E35ad0a', symbol: 'GMX' },
  USDC: { address: '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8', symbol: 'USDC' },
  WBTC: { address: '0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f', symbol: 'WBTC' },
  DAI: { address: '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1', symbol: 'DAI' }
};

/**
 * Most popular liquidity pools in uni v3 to use in a route.
 */
const routerLiquidityPools = [
  new LiquidityPool(
    '0x80A9ae39310abf666A87C743d6ebBD0E8C42158E',
    routerTokens.WETH,
    routerTokens.GMX,
    10000
  ),
  new LiquidityPool(
    '0xC31E54c7a869B9FcBEcc14363CF510d1c41fa443',
    routerTokens.WETH,
    routerTokens.USDC,
    500
  ),
  new LiquidityPool(
    '0x149e36E72726e0BceA5c59d40df2c43F60f5A22D',
    routerTokens.WBTC,
    routerTokens.WETH,
    3000
  ),
  new LiquidityPool(
    '0x17c14D2c404D167802b16C450d3c99F88F2c4F4d',
    routerTokens.WETH,
    routerTokens.USDC,
    3000
  ),
  new LiquidityPool(
    '0x2f5e87C9312fa29aed5c179E456625D79015299c',
    routerTokens.WBTC,
    routerTokens.WETH,
    500
  ),
  new LiquidityPool(
    '0xd37Af656Abf91c7f548FfFC0133175b5e4d3d5e6',
    routerTokens.DAI,
    routerTokens.USDC,
    500
  )
];

export const UNI_SWAP_V3_ARBITRUM_CONSTANTS: UniswapV3Constants = {
  blockchain: BLOCKCHAIN_NAME.ARBITRUM,
  wethAddress,
  routerTokens,
  routerLiquidityPools
};
