import {
  swapRouterContractAbi,
  swapRouterContractAddress
} from 'src/app/features/instant-trade/services/instant-trade-service/providers/ethereum/uni-swap-v3-service/constants/swapRouterContractData';
import {
  quoterContractAbi,
  quoterContractAddress
} from 'src/app/features/instant-trade/services/instant-trade-service/providers/ethereum/uni-swap-v3-service/constants/quoterContractData';
import { ContractAddressNetMode } from 'src/app/shared/models/blockchain/NetMode';

export const uniSwapV3ContractData = {
  swapRouter: {
    address: swapRouterContractAddress,
    abi: swapRouterContractAbi
  },
  quoter: {
    address: quoterContractAddress,
    abi: quoterContractAbi
  }
};

export const wethAddressNetMode: ContractAddressNetMode = {
  mainnet: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
  testnet: '0xd0a1e359811322d97991e03f863a0c30c2cf029c'
};

export const maxTransitPools = 1;
