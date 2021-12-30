import { SupportedCrossChainBlockchain } from '@features/cross-chain-routing/services/cross-chain-routing-service/models/supported-cross-chain-blockchain';
import { ENVIRONMENT } from 'src/environments/environment';

export const crossChainContractAddresses: Record<SupportedCrossChainBlockchain, string> =
  ENVIRONMENT.crossChain.contractAddresses;
