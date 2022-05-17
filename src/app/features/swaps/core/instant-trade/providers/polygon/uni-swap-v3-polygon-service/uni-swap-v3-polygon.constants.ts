import { BLOCKCHAIN_NAME } from '@shared/models/blockchain/blockchain-name';
import { UniswapV3Constants } from '@features/swaps/core/instant-trade/providers/common/uniswap-v3/models/uniswap-v3-constants';
import { LiquidityPool } from '@features/swaps/core/instant-trade/providers/common/uniswap-v3/utils/quoter-controller/models/liquidity-pool';

const wethAddress = '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270';

/**
 * Most popular tokens in uni v3 to use in a route.
 */
const routerTokens = {
  WMATIC: { address: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270', symbol: 'WMATIC' },
  WETH: { address: '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619', symbol: 'WETH' },
  DAI: { address: '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063', symbol: 'DAI' },
  USDT: { address: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F', symbol: 'USDT' },
  USDC: { address: '0x2791bca1f2de4661ed88a30c99a7a9449aa84174', symbol: 'USDC' }
};

/**
 * Most popular liquidity pools in uni v3 to use in a route.
 */
const routerLiquidityPools = [
  new LiquidityPool(
    '0x167384319B41F7094e62f7506409Eb38079AbfF8',
    routerTokens.WMATIC,
    routerTokens.WETH,
    3000
  ),
  new LiquidityPool(
    '0x45dDa9cb7c25131DF268515131f647d726f50608',
    routerTokens.USDC,
    routerTokens.WETH,
    500
  ),
  new LiquidityPool(
    '0x0e44cEb592AcFC5D3F09D996302eB4C499ff8c10',
    routerTokens.USDC,
    routerTokens.WETH,
    3000
  ),
  new LiquidityPool(
    '0x3F5228d0e7D75467366be7De2c31D0d098bA2C23',
    routerTokens.USDC,
    routerTokens.USDT,
    500
  ),
  new LiquidityPool(
    '0x88f3C15523544835fF6c738DDb30995339AD57d6',
    routerTokens.WMATIC,
    routerTokens.USDC,
    3000
  ),
  new LiquidityPool(
    '0x86f1d8390222A3691C28938eC7404A1661E618e0',
    routerTokens.WMATIC,
    routerTokens.WETH,
    500
  )
];

export const UNI_SWAP_V3_POLYGON_CONSTANTS: UniswapV3Constants = {
  blockchain: BLOCKCHAIN_NAME.POLYGON,
  wethAddress,
  routerTokens,
  routerLiquidityPools
};
