import { BLOCKCHAIN_NAME } from '@shared/models/blockchain/blockchain-name';
import { UniswapV2Constants } from '@features/instant-trade/services/instant-trade-service/models/uniswap-v2/uniswap-v2-constants';

const sushiSwapContractAddress = '0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506';

const wethAddress = '0x82af49447d8a07e3bd95bd0d56f35241523fbab1';

const routingProviders = [
  { address: '0x82af49447d8a07e3bd95bd0d56f35241523fbab1', symbol: 'WETH' },
  { address: '0xfea7a6a0b346362bf88a9e4a88416b77a57d6c2a', symbol: 'MIM' },
  { address: '0x6c2c06790b3e3e3c38e12ee22f8183b37a13ee55', symbol: 'DPX' },
  { address: '0xff970a61a04b1ca14834a43f5de4533ebddb5cc8', symbol: 'USDC' },
  { address: '0x32eb7902d4134bf98a28b963d26de779af92a212', symbol: 'RDPX' },
  { address: '0x539bde0d7dbd336b79148aa742883198bbf60342', symbol: 'MAGIC' }
];

export const SUSHI_SWAP_ARBITRUM_CONSTANTS: UniswapV2Constants = {
  blockchain: BLOCKCHAIN_NAME.ARBITRUM,
  contractAddress: sushiSwapContractAddress,
  wethAddress,
  routingProviders,
  maxTransitTokens: 1
};
