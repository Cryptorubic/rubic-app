import { Inject, Injectable } from '@angular/core';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { PROVIDERS } from 'src/app/features/swaps-page-old/instant-trades/models/providers.enum';
import { OneInchEthService } from 'src/app/features/instant-trade/services/instant-trade-service/providers/one-inch-eth-service/one-inch-eth.service';
import { SwapFormService } from 'src/app/features/swaps/services/swaps-form-service/swap-form.service';
import BigNumber from 'bignumber.js';
import { TuiNotification, TuiNotificationsService } from '@taiga-ui/core';
import { Subscription, timer } from 'rxjs';
import { UniSwapService } from 'src/app/features/instant-trade/services/instant-trade-service/providers/uni-swap-service/uni-swap.service';
import { ErrorsService } from 'src/app/core/errors/errors.service';
import { InstantTradesPostApi } from 'src/app/core/services/backend/instant-trades-api/types/trade-api';
import { switchMap } from 'rxjs/operators';
import { INTSTANT_TRADES_TRADE_STATUS } from 'src/app/features/swaps-page-old/models/trade-data';
import { InstantTradesApiService } from 'src/app/core/services/backend/instant-trades-api/instant-trades-api.service';
import { Web3PublicService } from 'src/app/core/services/blockchain/web3-public-service/web3-public.service';
import { OneInchPolService } from 'src/app/features/instant-trade/services/instant-trade-service/providers/one-inch-polygon-service/one-inch-pol.service';
import { QuickSwapService } from 'src/app/features/instant-trade/services/instant-trade-service/providers/quick-swap-service/quick-swap.service';
import { PancakeSwapService } from 'src/app/features/instant-trade/services/instant-trade-service/providers/pancake-swap-service/pancake-swap.service';

@Injectable({
  providedIn: 'root'
})
export class InstantTradeService {
  private blockchainsProviders;

  private currentBlockchain: BLOCKCHAIN_NAME;

  private modalShowing: Subscription;

  constructor(
    private readonly oneInchEthService: OneInchEthService,
    private readonly swapFormService: SwapFormService,
    private readonly uniswapService: UniSwapService,
    private readonly errorService: ErrorsService,
    private readonly instantTradesApiService: InstantTradesApiService,
    private readonly oneInchPolygonService: OneInchPolService,
    private readonly pancakeSwapService: PancakeSwapService,
    private readonly quickSwapService: QuickSwapService,
    @Inject(TuiNotificationsService) private readonly notificationsService: TuiNotificationsService,
    private readonly web3Public: Web3PublicService
  ) {
    this.currentBlockchain = BLOCKCHAIN_NAME.ETHEREUM;
    this.setBlockchainsProviders();
    this.swapFormService.itProviders.subscribe(providers => {
      this.blockchainsProviders = providers;
    });
    this.swapFormService.commonTrade.controls.input.valueChanges.subscribe(form => {
      if (form.fromBlockchain === form.toBlockchain) {
        this.currentBlockchain = form.fromBlockchain;
      }
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
    try {
      const receipt = await this.blockchainsProviders[this.currentBlockchain][provider].createTrade(
        trade,
        {
          onConfirm: async () => {
            this.modalShowing = this.notificationsService
              .show('Transaction in progress', {
                status: TuiNotification.Info,
                autoClose: false,
                hasCloseButton: false
              })
              .subscribe();
            await this.postTrade(trade);
          }
        }
      );
      this.modalShowing.unsubscribe();
      this.updateTrade(receipt.transactionHash, INTSTANT_TRADES_TRADE_STATUS.COMPLETED);
      this.notificationsService
        .show('Transaction completed', {
          status: TuiNotification.Success
        })
        .subscribe();
      await this.instantTradesApiService.notifyInstantTradesBot({
        provider,
        blockchain: this.currentBlockchain,
        walletAddress: receipt.from,
        trade,
        txHash: receipt.transactionHash
      });
    } catch (err) {
      this.errorService.catch$(err);
    }
  }

  public async postTrade(data: InstantTradesPostApi) {
    const web3Public = this.web3Public[this.currentBlockchain];
    const transaction = await web3Public.getTransactionByHash(data.hash, 0, 60, 1000);
    const delay = transaction ? 100 : 1000;
    // TODO: Fix post request. Have to delay request to fix problem with finding transaction on backend.
    timer(delay)
      .pipe(switchMap(() => this.instantTradesApiService.createTrade(data)))
      .subscribe();
  }

  public updateTrade(hash: string, status: INTSTANT_TRADES_TRADE_STATUS) {
    return this.instantTradesApiService.patchTrade(hash, status).subscribe();
  }

  private setBlockchainsProviders(): void {
    this.swapFormService.setItProviders({
      [BLOCKCHAIN_NAME.ETHEREUM]: {
        [PROVIDERS.ONEINCH]: this.oneInchEthService,
        [PROVIDERS.UNISWAP]: this.uniswapService
      },
      [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: {
        // [PROVIDERS.ONEINCH]: this.ethereumBinanceBridgeProviderService,
        [PROVIDERS.PANCAKESWAP]: this.pancakeSwapService
      },
      [BLOCKCHAIN_NAME.POLYGON]: {
        [PROVIDERS.ONEINCH]: this.oneInchPolygonService,
        [PROVIDERS.QUICKSWAP]: this.quickSwapService
      }
    });
  }
}
