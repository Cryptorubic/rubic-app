import { SupportedCrossChainSwapBlockchain } from '@features/cross-chain-routing/services/cross-chain-routing-service/models/supported-cross-chain-swap-blockchain';
import { environment } from 'src/environments/environment';

export const CrossChainSwapContractAddress: Record<SupportedCrossChainSwapBlockchain, string[]> =
  environment.crossChain.contractAddresses;
