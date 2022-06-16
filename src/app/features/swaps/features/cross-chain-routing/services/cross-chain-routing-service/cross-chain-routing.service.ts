import { Injectable } from '@angular/core';
import { TradeService } from '@features/swaps/core/services/trade-service/trade.service';
import { BlockchainName } from 'rubic-sdk';
import { RubicCrossChainTradeProvider } from 'rubic-sdk/lib/features/cross-chain/providers/rubic-trade-provider/rubic-cross-chain-trade-provider';
import { CelerCrossChainTradeProvider } from 'rubic-sdk/lib/features/cross-chain/providers/celer-trade-provider/celer-cross-chain-trade-provider';
import { SymbiosisCrossChainTradeProvider } from 'rubic-sdk/lib/features/cross-chain/providers/symbiosis-trade-provider/symbiosis-cross-chain-trade-provider';

@Injectable({
  providedIn: 'root'
})
export class CrossChainRoutingService extends TradeService {
  public static isSupportedBlockchain(blockchainName: BlockchainName): boolean {
    return (
      RubicCrossChainTradeProvider.isSupportedBlockchain(blockchainName) ||
      CelerCrossChainTradeProvider.isSupportedBlockchain(blockchainName) ||
      SymbiosisCrossChainTradeProvider.isSupportedBlockchain(blockchainName)
    );
  }
}
