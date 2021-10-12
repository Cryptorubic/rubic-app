import { SupportedCrossChainSwapBlockchain } from 'src/app/features/cross-chain-routing/services/cross-chain-routing-service/models/SupportedCrossChainSwapBlockchain';
import { environment } from 'src/environments/environment';

export const crossChainSwapContractAddresses: Record<SupportedCrossChainSwapBlockchain, string> =
  environment.ccrContractAddresses;
