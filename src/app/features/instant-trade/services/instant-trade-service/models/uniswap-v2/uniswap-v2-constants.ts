import { ContractAddressNetMode, NetMode } from '@shared/models/blockchain/net-mode';
import { EthLikeBlockchainName } from '@shared/models/blockchain/blockchain-name';
import { SymbolToken } from '@shared/models/tokens/symbol-token';

export type RoutingProvidersNetMode = {
  [mode in NetMode]: SymbolToken[];
};

export interface UniswapV2Constants {
  blockchain: EthLikeBlockchainName;
  contractAddressNetMode: ContractAddressNetMode;
  wethAddressNetMode: ContractAddressNetMode;
  routingProvidersNetMode: RoutingProvidersNetMode;
  maxTransitTokens: number;
}
