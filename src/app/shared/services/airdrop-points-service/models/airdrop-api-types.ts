import { ToBackendCrossChainProviders } from '@app/core/services/backend/cross-chain-routing-api/constants/to-backend-cross-chain-providers';
import { ToBackendOnChainProviders } from '@app/features/trade/services/on-chain-api/constants/backend-providers';
import { BackendBlockchain } from '@app/shared/constants/blockchain/backend-blockchains';

export interface OnChainRewardResponse {
  amount: number;
  contract_address: string;
}

export interface CrossChainRewardResponse extends OnChainRewardResponse {}

export interface CrossChainRewardRequestParams {
  /**
   * user wallet address
   */
  address: string;
  /**
   * backend provider name
   */
  provider: ToBackendCrossChainProviders;
  from_network: BackendBlockchain;
  to_network: BackendBlockchain;
  /**
   * fromToken address
   */
  from_token: string;
  /**
   * toToken address
   */
  to_token: string;
}

export interface OnChainRewardRequestParams {
  address: string;
  provider: ToBackendOnChainProviders;
  network: BackendBlockchain;
  from_token: string;
  to_token: string;
}
