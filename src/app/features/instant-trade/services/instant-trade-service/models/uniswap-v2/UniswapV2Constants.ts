import { ContractAddressNetMode, NetMode } from 'src/app/shared/models/blockchain/NetMode';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { SymbolToken } from '@shared/models/tokens/SymbolToken';

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
