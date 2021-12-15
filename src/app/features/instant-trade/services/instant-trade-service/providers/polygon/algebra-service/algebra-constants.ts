import { ContractAddressNetMode } from 'src/app/shared/models/blockchain/NetMode';
import {
  quoterContractAbi,
  quoterContractAddress
} from '@features/instant-trade/services/instant-trade-service/providers/polygon/algebra-service/constants/quoterContractData';
import {
  swapRouterContractAbi,
  swapRouterContractAddress
} from '@features/instant-trade/services/instant-trade-service/providers/polygon/algebra-service/constants/swapRouterContractData';
import { ContractData } from '@shared/models/blockchain/ContractData';
import { UniV3AlgebraConstants } from '@features/instant-trade/services/instant-trade-service/providers/common/uni-v3-algebra/common-service/models/UniV3AlgebraConstants';
import { BLOCKCHAIN_NAME } from '@shared/models/blockchain/BLOCKCHAIN_NAME';

const wethAddressNetMode: ContractAddressNetMode = {
  mainnet: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270',
  testnet: '0x13c038147aa2c91cf1fdb6f17a12f27715a4ca99'
};

const swapRouterContract: ContractData = {
  address: swapRouterContractAddress,
  abi: swapRouterContractAbi
};

export const quoterContract: ContractData = {
  address: quoterContractAddress,
  abi: quoterContractAbi
};

export const maxTransitTokens = 1;

export const algebraV3Constants: UniV3AlgebraConstants = {
  blockchain: BLOCKCHAIN_NAME.POLYGON,
  wethAddressNetMode,
  swapRouterContract,
  isAlgebra: true
};
