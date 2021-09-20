import { ContractAddressNetMode, NetMode } from 'src/app/shared/models/blockchain/NetMode';

export type RoutingProvidersNetMode = {
  [mode in NetMode]: string[];
};

export interface UniswapV2Constants {
  contractAddressNetMode: ContractAddressNetMode;
  wethAddressNetMode: ContractAddressNetMode;
  routingProvidersNetMode: RoutingProvidersNetMode;
  maxTransitTokens: number;
}
