import {
  swapRouterContractAbi,
  swapRouterContractAddress
} from 'src/app/features/instant-trade/services/instant-trade-service/providers/ethereum/uni-swap-v3-service/constants/swapRouterContractData';
import {
  quoterContractAbi,
  quoterContractAddress
} from 'src/app/features/instant-trade/services/instant-trade-service/providers/ethereum/uni-swap-v3-service/constants/quoterContractData';
import { ContractAddressNetMode } from 'src/app/shared/models/blockchain/NetMode';
import { UniV3AlgebraConstants } from '@features/instant-trade/services/instant-trade-service/providers/common/uni-v3-algebra/common-service/models/UniV3AlgebraConstants';
import { BLOCKCHAIN_NAME } from '@shared/models/blockchain/BLOCKCHAIN_NAME';
import { ContractData } from '@shared/models/blockchain/ContractData';

const wethAddressNetMode: ContractAddressNetMode = {
  mainnet: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
  testnet: '0xd0a1e359811322d97991e03f863a0c30c2cf029c'
};

const swapRouterContract: ContractData = {
  address: swapRouterContractAddress,
  abi: swapRouterContractAbi
};

export const quoterContract: ContractData = {
  address: quoterContractAddress,
  abi: quoterContractAbi
};

export const maxTransitPools = 1;

export const uniSwapV3Constants: UniV3AlgebraConstants = {
  blockchain: BLOCKCHAIN_NAME.ETHEREUM,
  wethAddressNetMode,
  swapRouterContract,
  isAlgebra: false
};
