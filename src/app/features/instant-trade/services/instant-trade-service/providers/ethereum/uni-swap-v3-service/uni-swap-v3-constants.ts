import { swapRouterContractData } from 'src/app/features/instant-trade/services/instant-trade-service/providers/ethereum/uni-swap-v3-service/constants/swapRouterContractData';
import { quoterContractData } from 'src/app/features/instant-trade/services/instant-trade-service/providers/ethereum/uni-swap-v3-service/constants/quoterContractData';

export const uniSwapV3Contracts = {
  swapRouter: swapRouterContractData,
  quoter: quoterContractData
};

export const wethAddressWithMode = {
  mainnet: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
  testnet: '0xd0a1e359811322d97991e03f863a0c30c2cf029c'
};

export const maxTransitPools = 1;
