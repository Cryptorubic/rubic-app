import { Inject, Injectable } from '@angular/core';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { PROVIDERS } from 'src/app/features/swaps-page-old/instant-trades/models/providers.enum';
import { OneInchEthService } from 'src/app/features/instant-trade/services/instant-trade-service/providers/one-inch-eth-service/one-inch-eth.service';
import { SwapFormService } from 'src/app/features/swaps/services/swaps-form-service/swap-form.service';
import BigNumber from 'bignumber.js';
import { TuiNotification, TuiNotificationsService } from '@taiga-ui/core';
import { Subscription } from 'rxjs';
import { UniSwapService } from 'src/app/features/instant-trade/services/instant-trade-service/providers/uni-swap-service/uni-swap.service';

@Injectable({
  providedIn: 'root'
})
export class InstantTradeService {
  private blockchainsProviders;

  private readonly currentBlockchain: any;

  private modalShowing: Subscription;

  constructor(
    private readonly oneInchEthService: OneInchEthService,
    private readonly swapFormService: SwapFormService,
    private readonly uniswapService: UniSwapService,
    @Inject(TuiNotificationsService) private readonly notificationsService: TuiNotificationsService
  ) {
    this.currentBlockchain = 'ETH';
    this.setBlockchainsProviders();
    this.swapFormService.itProviders.subscribe(providers => {
      this.blockchainsProviders = providers;
    });
  }

  public async calculateTrades(): Promise<any> {
    const { fromAmount, fromToken, toToken } =
      this.swapFormService.commonTrade.controls.input.value;
    const providersDataPromises = Object.values(
      this.blockchainsProviders[this.currentBlockchain]
    ).map(async provider =>
      (provider as any).calculateTrade(new BigNumber(fromAmount), fromToken, toToken)
    );
    return Promise.allSettled(providersDataPromises);
  }

  public async createTrade(provider: PROVIDERS, trade): Promise<void> {
    await this.blockchainsProviders[this.currentBlockchain][provider].createTrade(trade, {
      onConfirm: () => {
        this.modalShowing = this.notificationsService
          .show('Transaction in progress', {
            status: TuiNotification.Info,
            autoClose: false,
            hasCloseButton: false
          })
          .subscribe();
      }
    });
    this.modalShowing.unsubscribe();
    this.notificationsService
      .show('Transaction completed', {
        status: TuiNotification.Success
      })
      .subscribe();
  }

  private setBlockchainsProviders(): void {
    this.swapFormService.setItProviders({
      [BLOCKCHAIN_NAME.ETHEREUM]: {
        [PROVIDERS.ONEINCH]: this.oneInchEthService,
        [PROVIDERS.UNISWAP]: this.uniswapService
      },
      [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: {
        // [PROVIDERS.ONEINCH]: this.ethereumBinanceBridgeProviderService,
        // [PROVIDERS.PANCAKESWAP]: this.binanceTronBridgeProviderService
      },
      [BLOCKCHAIN_NAME.POLYGON]: {
        // [PROVIDERS.ONEINCH]: this.ethereumPolygonBridgeProviderService,
        // [PROVIDERS.QUICKSWAP]: this.ethereumPolygonBridgeProviderService
      }
    });
  }
}
