import {
  QUOTER_CONTRACT_ABI,
  QUOTER_CONTRACT_ADDRESS
} from '@features/swaps/features/instant-trade/services/instant-trade-service/providers/polygon/algebra-service/constants/quoter-contract-data';
import {
  SWAP_ROUTER_CONTRACT_ABI,
  SWAP_ROUTER_CONTRACT_ADDRESS
} from '@features/swaps/features/instant-trade/services/instant-trade-service/providers/polygon/algebra-service/constants/swap-router-contract-data';
import { ContractData } from '@shared/models/blockchain/contract-data';
import { UniswapV3AlgebraConstants } from '@features/swaps/features/instant-trade/services/instant-trade-service/providers/common/uniswap-v3-algebra/common-service/models/uniswap-v3-algebra-constants';
import { BLOCKCHAIN_NAME } from '@shared/models/blockchain/blockchain-name';

const wethAddress = '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270';

const swapRouterContract: ContractData = {
  address: SWAP_ROUTER_CONTRACT_ADDRESS,
  abi: SWAP_ROUTER_CONTRACT_ABI
};

export const quoterContract: ContractData = {
  address: QUOTER_CONTRACT_ADDRESS,
  abi: QUOTER_CONTRACT_ABI
};

export const maxTransitTokens = 1;

export const algebraConstants: UniswapV3AlgebraConstants = {
  blockchain: BLOCKCHAIN_NAME.POLYGON,
  wethAddress,
  swapRouterContract
};
