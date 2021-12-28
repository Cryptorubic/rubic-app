import {
  swapRouterContractAbi,
  swapRouterContractAddress
} from '@features/instant-trade/services/instant-trade-service/providers/ethereum/uni-swap-v3-service/constants/swap-router-contract-data';
import {
  quoterContractAbi,
  quoterContractAddress
} from '@features/instant-trade/services/instant-trade-service/providers/ethereum/uni-swap-v3-service/constants/quoter-contract-data';
import { ContractAddressNetMode } from '@shared/models/blockchain/net-mode';
import { UniV3AlgebraConstants } from '@features/instant-trade/services/instant-trade-service/providers/common/uni-v3-algebra/common-service/models/uni-v3-algebra-constants';
import { BLOCKCHAIN_NAME } from '@shared/models/blockchain/blockchain-name';
import { ContractData } from '@shared/models/blockchain/contract-data';

const wethAddressNetMode: ContractAddressNetMode = {
  mainnet: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
  testnet: '0xd0a1e359811322d97991e03f863a0c30c2cf029c'
};

const swapRouterContract: ContractData = {
  address: swapRouterContractAddress,
  abi: swapRouterContractAbi
};

export const QUOTER_CONTRACT: ContractData = {
  address: quoterContractAddress,
  abi: quoterContractAbi
};

export const MAX_TRANSIT_POOL = 1;

export const UNI_SWAP_V3_CONSTANTS: UniV3AlgebraConstants = {
  blockchain: BLOCKCHAIN_NAME.ETHEREUM,
  wethAddressNetMode,
  swapRouterContract,
  isAlgebra: false
};
