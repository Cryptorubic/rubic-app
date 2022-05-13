import { BLOCKCHAIN_NAME } from '@shared/models/blockchain/blockchain-name';
import { UniswapV2Constants } from '@features/swaps/features/instant-trade/services/instant-trade-service/providers/common/uniswap-v2/common-service/models/uniswap-v2-constants';

const sushiSwapContractAddress = '0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F';

const wethAddress = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2';

const routingProviders = [
  { address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', symbol: 'WETH' },
  { address: '0xdac17f958d2ee523a2206206994597c13d831ec7', symbol: 'USDT' },
  { address: '0x6b175474e89094c44da98b954eedeac495271d0f', symbol: 'DAI' },
  { address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', symbol: 'USDC' }
];

export const SUSHI_SWAP_ETH_CONSTANTS: UniswapV2Constants = {
  blockchain: BLOCKCHAIN_NAME.ETHEREUM,
  contractAddress: sushiSwapContractAddress,
  wethAddress,
  routingProviders,
  maxTransitTokens: 1
};
