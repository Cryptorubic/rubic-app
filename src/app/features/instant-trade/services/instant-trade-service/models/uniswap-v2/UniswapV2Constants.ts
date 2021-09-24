import { ContractAddressNetMode, NetMode } from 'src/app/shared/models/blockchain/NetMode';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';

export type RoutingProvidersNetMode = {
  [mode in NetMode]: string[];
};

export interface UniswapV2Constants {
  blockchain: BLOCKCHAIN_NAME;
  contractAddressNetMode: ContractAddressNetMode;
  wethAddressNetMode: ContractAddressNetMode;
  routingProvidersNetMode: RoutingProvidersNetMode;
  maxTransitTokens: number;
}
