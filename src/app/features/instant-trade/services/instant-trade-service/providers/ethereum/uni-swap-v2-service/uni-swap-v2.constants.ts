import { UniswapV2Constants } from '@features/instant-trade/services/instant-trade-service/models/uniswap-v2/uniswap-v2-constants';
import { BLOCKCHAIN_NAME } from '@shared/models/blockchain/blockchain-name';

const uniSwapContractAddress = '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D';

const wethAddress = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2';

const routingProviders = [
  { address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', symbol: 'WETH' },
  { address: '0xdac17f958d2ee523a2206206994597c13d831ec7', symbol: 'USDT' },
  { address: '0x6b175474e89094c44da98b954eedeac495271d0f', symbol: 'DAI' },
  { address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', symbol: 'USDC' }
];

export const UNI_SWAP_V2_CONSTANTS: UniswapV2Constants = {
  blockchain: BLOCKCHAIN_NAME.ETHEREUM,
  contractAddress: uniSwapContractAddress,
  wethAddress,
  routingProviders,
  maxTransitTokens: 2
};
