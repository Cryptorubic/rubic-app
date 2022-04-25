import { UniswapV2Constants } from '@features/swaps/features/instant-trade/services/instant-trade-service/providers/common/uniswap-v2/common-service/models/uniswap-v2-constants';
import { BLOCKCHAIN_NAME } from '@shared/models/blockchain/blockchain-name';

const sushiSwapAvalancheContractAddress = '0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506';

const wethAddress = '0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7';

const routingProviders = [
  { address: '0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7', symbol: 'WAVAX' },
  { address: '0xc7198437980c041c805A1EDcbA50c1Ce5db95118', symbol: 'USDT' },
  { address: '0xA7D7079b0FEaD91F3e65f86E8915Cb59c1a4C664', symbol: 'USDC' },
  { address: '0xd586E7F844cEa2F87f50152665BCbc2C279D8d70', symbol: 'DAI' },
  { address: '0x60781C2586D68229fde47564546784ab3fACA982', symbol: 'PNG' },
  { address: '0x49D5c2BdFfac6CE2BFdB6640F4F80f226bc10bAB', symbol: 'WETH' },
  { address: '0xd1c3f94DE7e5B45fa4eDBBA472491a9f4B166FC4', symbol: 'XAVA' }
];

export const SUSHI_SWAP_AVALANCHE_CONSTANTS: UniswapV2Constants = {
  blockchain: BLOCKCHAIN_NAME.AVALANCHE,
  contractAddress: sushiSwapAvalancheContractAddress,
  wethAddress,
  routingProviders,
  maxTransitTokens: 3
};
