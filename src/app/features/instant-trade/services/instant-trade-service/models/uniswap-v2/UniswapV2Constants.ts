import { ContractAddressNetMode, NetMode } from 'src/app/shared/models/blockchain/NetMode';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { SWAP_METHODS } from 'src/app/features/instant-trade/services/instant-trade-service/providers/common/uniswap-v2/common-service/models/SWAP_METHOD';

export type RoutingProvidersNetMode = {
  [mode in NetMode]: string[];
};

export interface UniswapV2Constants {
  blockchain: BLOCKCHAIN_NAME;
  contractAddressNetMode: ContractAddressNetMode;
  wethAddressNetMode: ContractAddressNetMode;
  routingProvidersNetMode: RoutingProvidersNetMode;
  maxTransitTokens: number;
  methods?: SWAP_METHODS;
}
