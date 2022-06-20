import { Injectable } from '@angular/core';
import { TradeService } from '@features/swaps/core/services/trade-service/trade.service';
import { BlockchainName } from 'rubic-sdk';
import { RubicCrossChainTradeProvider } from 'rubic-sdk/lib/features/cross-chain/providers/rubic-trade-provider/rubic-cross-chain-trade-provider';
import { CelerCrossChainTradeProvider } from 'rubic-sdk/lib/features/cross-chain/providers/celer-trade-provider/celer-cross-chain-trade-provider';
import { SymbiosisCrossChainTradeProvider } from 'rubic-sdk/lib/features/cross-chain/providers/symbiosis-trade-provider/symbiosis-cross-chain-trade-provider';
import { WrappedCrossChainTrade } from 'rubic-sdk/lib/features/cross-chain/providers/common/models/wrapped-cross-chain-trade';
import { RubicSdkService } from '@features/swaps/core/services/rubic-sdk-service/rubic-sdk.service';
import { SwapFormService } from '@features/swaps/features/main-form/services/swap-form-service/swap-form.service';
import { SettingsService } from '@features/swaps/features/main-form/services/settings-service/settings.service';
import { SwapManagerCrossChainCalculationOptions } from 'rubic-sdk/lib/features/cross-chain/models/swap-manager-cross-chain-options';
import { RubicError } from '@core/errors/models/rubic-error';

@Injectable({
  providedIn: 'root'
})
export class CrossChainRoutingService extends TradeService {
  public crossChainTrade: WrappedCrossChainTrade;

  public static isSupportedBlockchain(blockchainName: BlockchainName): boolean {
    return (
      RubicCrossChainTradeProvider.isSupportedBlockchain(blockchainName) ||
      CelerCrossChainTradeProvider.isSupportedBlockchain(blockchainName) ||
      SymbiosisCrossChainTradeProvider.isSupportedBlockchain(blockchainName)
    );
  }

  constructor(
    private readonly sdk: RubicSdkService,
    private readonly swapFormService: SwapFormService,
    private readonly settingsService: SettingsService
  ) {
    super('cross-chain-routing');
  }

  public async calculateTrade(_needApprove?: boolean): Promise<WrappedCrossChainTrade> {
    const { fromToken, fromAmount, toToken } = this.swapFormService.inputValue;
    const slippageTolerance = this.settingsService.crossChainRoutingValue.slippageTolerance / 100;
    // @TODO SDK.
    const options: SwapManagerCrossChainCalculationOptions = {
      fromSlippageTolerance: slippageTolerance / 2,
      toSlippageTolerance: slippageTolerance / 2,
      slippageTolerance
    } as unknown;

    this.crossChainTrade = await this.sdk.crossChain.calculateTrade(
      fromToken,
      fromAmount.toString(),
      toToken,
      options
    );
    return this.crossChainTrade;
  }

  public async createTrade(confirmCallback?: () => void): Promise<void> {
    if (!this.crossChainTrade?.trade) {
      throw new RubicError('[RUBIC SDK] Cross chain trade object not found.');
    }
    await this.crossChainTrade.trade.swap({
      onConfirm: confirmCallback
    });
  }
}
