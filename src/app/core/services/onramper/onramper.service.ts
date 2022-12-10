import { Injectable } from '@angular/core';
import { RecentTradesStoreService } from '@core/services/recent-trades/recent-trades-store.service';
import { isOnramperRecentTrade } from '@shared/utils/recent-trades/is-onramper-recent-trade';
import BigNumber from 'bignumber.js';
import { GasService } from '@core/services/gas-service/gas.service';
import { onChainProxyMaxGasLimit } from '@core/services/onramper/constants/on-chain-proxy-max-gas-limit';
import { OnramperRecentTrade } from '@shared/models/recent-trades/onramper-recent-trade';
import { SwapFormService } from '@core/services/swaps/swap-form.service';
import { TokensService } from '@core/services/tokens/tokens.service';
import { EvmWeb3Pure } from 'rubic-sdk';

@Injectable({
  providedIn: 'root'
})
export class OnramperService {
  constructor(
    private readonly recentTradesStoreService: RecentTradesStoreService,
    private readonly gasService: GasService,
    private readonly swapFormService: SwapFormService,
    private readonly tokensService: TokensService
  ) {}

  public async updateSwapFormByRecentTrade(txId: string): Promise<void> {
    const trade = this.recentTradesStoreService.currentUserRecentTrades.find(
      currentTrade => isOnramperRecentTrade(currentTrade) && currentTrade.txId === txId
    ) as OnramperRecentTrade;

    const blockchain = trade.toToken.blockchain;
    const nativeToken = await this.tokensService.findToken({
      address: EvmWeb3Pure.nativeTokenAddress,
      blockchain
    });

    const gasPrice = await this.gasService.getGasPriceInEthUnits(blockchain);
    const gasFee = gasPrice.multipliedBy(onChainProxyMaxGasLimit);
    const fromAmount = new BigNumber(trade.fromAmount).minus(gasFee);

    const toToken = await this.tokensService.findToken(trade.toToken);

    this.swapFormService.inputControl.patchValue({
      fromAssetType: blockchain,
      fromAsset: nativeToken,
      toBlockchain: blockchain,
      toToken,
      fromAmount
    });
  }
}
