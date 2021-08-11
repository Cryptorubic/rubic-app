import { NetMode } from 'src/app/shared/models/blockchain/NetMode';

export type ContractAddressNetMode = {
  [mode in NetMode]: string;
};

export type WethAddressNetMode = {
  [mode in NetMode]: string;
};

export type RoutingProvidersNetMode = {
  [mode in NetMode]: string[];
};

export interface UniswapV2Constants {
  contractAddressNetMode: ContractAddressNetMode;
  wethAddressNetMode: WethAddressNetMode;
  routingProvidersNetMode: RoutingProvidersNetMode;
  maxTransitTokens: number;
}
