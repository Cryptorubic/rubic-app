import { SupportedCrossChainBlockchain } from '@features/cross-chain-routing/services/cross-chain-routing-service/models/supported-cross-chain-blockchain';
import { environment } from 'src/environments/environment';

export const crossChainSwapContractAddresses: Record<SupportedCrossChainBlockchain, string> =
  environment.crossChain.contractAddresses;
