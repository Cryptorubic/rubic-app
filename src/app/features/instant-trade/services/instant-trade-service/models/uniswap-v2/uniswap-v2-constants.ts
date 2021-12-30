import { ContractAddressNetMode, NetMode } from '@shared/models/blockchain/net-mode';
import { BLOCKCHAIN_NAME } from '@shared/models/blockchain/blockchain-name';
import { SymbolToken } from '@shared/models/tokens/symbol-token';

export type RoutingProvidersNetMode = {
  [mode in NetMode]: SymbolToken[];
};

export interface UniswapV2Constants {
  blockchain: BLOCKCHAIN_NAME;
  contractAddressNetMode: ContractAddressNetMode;
  wethAddressNetMode: ContractAddressNetMode;
  routingProvidersNetMode: RoutingProvidersNetMode;
  maxTransitTokens: number;
}
