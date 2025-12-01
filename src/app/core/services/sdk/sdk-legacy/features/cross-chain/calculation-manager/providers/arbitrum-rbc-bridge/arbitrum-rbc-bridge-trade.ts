import { EvmTransactionConfig } from '@cryptorubic/web3';
import { SwapResponseInterface } from '../../../../ws-api/models/swap-response-interface';
import { EvmApiCrossChainTrade } from '../../../../ws-api/chains/evm/evm-api-cross-chain-trade';
import { BLOCKCHAIN_NAME } from '@cryptorubic/core';
import { RubicApiService } from '@app/core/services/sdk/sdk-legacy/rubic-api/rubic-api.service';

export class ArbitrumRbcBridgeTrade extends EvmApiCrossChainTrade {
  public static async redeemTokens(
    sourceTransactionHash: string,
    rubicApiService: RubicApiService
  ): Promise<SwapResponseInterface<EvmTransactionConfig>> {
    return rubicApiService.claimOrRedeemCoins(sourceTransactionHash, BLOCKCHAIN_NAME.ARBITRUM);
  }
}
