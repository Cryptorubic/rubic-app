import { ContractAddressNetMode } from '@shared/models/blockchain/net-mode';
import {
  QUOTER_CONTRACT_ABI,
  QUOTER_CONTRACT_ADDRESS
} from '@features/instant-trade/services/instant-trade-service/providers/polygon/algebra-service/constants/quoter-contract-data';
import {
  SWAP_ROUTER_CONTRACT_ABI,
  SWAP_ROUTER_CONTRACT_ADDRESS
} from '@features/instant-trade/services/instant-trade-service/providers/polygon/algebra-service/constants/swap-router-contract-data';
import { ContractData } from '@shared/models/blockchain/contract-data';
import { UniV3AlgebraConstants } from '@features/instant-trade/services/instant-trade-service/providers/common/uni-v3-algebra/common-service/models/uni-v3-algebra-constants';
import { BLOCKCHAIN_NAME } from '@shared/models/blockchain/blockchain-name';

const wethAddressNetMode: ContractAddressNetMode = {
  mainnet: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270',
  testnet: '0x13c038147aa2c91cf1fdb6f17a12f27715a4ca99'
};

const swapRouterContract: ContractData = {
  address: SWAP_ROUTER_CONTRACT_ADDRESS,
  abi: SWAP_ROUTER_CONTRACT_ABI
};

export const quoterContract: ContractData = {
  address: QUOTER_CONTRACT_ADDRESS,
  abi: QUOTER_CONTRACT_ABI
};

export const maxTransitTokens = 1;

export const algebraConstants: UniV3AlgebraConstants = {
  blockchain: BLOCKCHAIN_NAME.POLYGON,
  wethAddressNetMode,
  swapRouterContract,
  isAlgebra: true
};
