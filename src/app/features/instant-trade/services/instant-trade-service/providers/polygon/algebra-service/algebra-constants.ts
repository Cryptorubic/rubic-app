import { ContractAddressNetMode } from 'src/app/shared/models/blockchain/NetMode';
import {
  quoterContractAbi,
  quoterContractAddress
} from '@features/instant-trade/services/instant-trade-service/providers/polygon/algebra-service/constants/quoterContractData';
import {
  swapRouterContractAbi,
  swapRouterContractAddress
} from '@features/instant-trade/services/instant-trade-service/providers/polygon/algebra-service/constants/swapRouterContractData';

export const algebraContractData = {
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
  mainnet: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270',
  testnet: '0x13c038147aa2c91cf1fdb6f17a12f27715a4ca99'
};

export const maxTransitTokens = 1;
