import { SupportedCrossChainSwapBlockchain } from '@features/cross-chain-routing/services/cross-chain-routing-service/models/supported-cross-chain-swap-blockchain';
import { ENVIRONMENT } from 'src/environments/environment';

export const CROSS_CHAIN_SWAP_CONTRACT_ADDRESS: Record<
  SupportedCrossChainSwapBlockchain,
  string[]
> = ENVIRONMENT.crossChain.contractAddresses;
