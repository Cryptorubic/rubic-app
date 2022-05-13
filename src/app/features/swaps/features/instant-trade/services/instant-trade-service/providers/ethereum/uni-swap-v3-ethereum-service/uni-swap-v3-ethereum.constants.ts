import { BLOCKCHAIN_NAME } from '@shared/models/blockchain/blockchain-name';
import { UniswapV3Constants } from '@features/swaps/features/instant-trade/services/instant-trade-service/providers/common/uniswap-v3/models/uniswap-v3-constants';
import { LiquidityPool } from '@features/swaps/features/instant-trade/services/instant-trade-service/providers/common/uniswap-v3/utils/quoter-controller/models/liquidity-pool';

const wethAddress = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2';

/**
 * Most popular tokens in uni v3 to use in a route.
 */
const routerTokens = {
  WETH: { address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', symbol: 'WETH' },
  USDT: { address: '0xdac17f958d2ee523a2206206994597c13d831ec7', symbol: 'USDT' },
  USDC: { address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', symbol: 'USDC' },
  WBTC: { address: '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599', symbol: 'WBTC' },
  DAI: { address: '0x6b175474e89094c44da98b954eedeac495271d0f', symbol: 'DAI' }
};

/**
 * Most popular liquidity pools in uni v3 to use in a route.
 */
const routerLiquidityPools = [
  new LiquidityPool(
    '0x8ad599c3A0ff1De082011EFDDc58f1908eb6e6D8',
    routerTokens.USDC,
    routerTokens.WETH,
    3000
  ),
  new LiquidityPool(
    '0x7858E59e0C01EA06Df3aF3D20aC7B0003275D4Bf',
    routerTokens.USDC,
    routerTokens.USDT,
    500
  ),
  new LiquidityPool(
    '0xCBCdF9626bC03E24f779434178A73a0B4bad62eD',
    routerTokens.WBTC,
    routerTokens.WETH,
    3000
  ),
  new LiquidityPool(
    '0x4e68Ccd3E89f51C3074ca5072bbAC773960dFa36',
    routerTokens.WETH,
    routerTokens.USDT,
    3000
  ),
  new LiquidityPool(
    '0x6c6Bc977E13Df9b0de53b251522280BB72383700',
    routerTokens.DAI,
    routerTokens.USDC,
    500
  ),
  new LiquidityPool(
    '0x88e6A0c2dDD26FEEb64F039a2c41296FcB3f5640',
    routerTokens.USDC,
    routerTokens.WETH,
    500
  )
];

export const UNI_SWAP_V3_ETHEREUM_CONSTANTS: UniswapV3Constants = {
  blockchain: BLOCKCHAIN_NAME.ETHEREUM,
  wethAddress,
  routerTokens,
  routerLiquidityPools
};
