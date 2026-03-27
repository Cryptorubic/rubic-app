import { ChangeDetectionStrategy, Component, OnInit, Self } from '@angular/core';
import { FormControl } from '@angular/forms';
import { NotificationsService } from '@app/core/services/notifications/notifications.service';
import { isReceiverCorrect } from '@app/features/privacy/providers/clearswap/constants/receiver-validator';
import { clearswapFormConfig } from '@app/features/privacy/providers/clearswap/constants/clearswap-form-config';
import { ClearswapErrorService } from '@app/features/privacy/providers/clearswap/services/clearswap-error.service';
import { ClearswapSwapService } from '@app/features/privacy/providers/clearswap/services/clearswap-swap.service';
import { ClearswapQuoteAdapter } from '@app/features/privacy/providers/clearswap/utils/clearswap-quote-adapter';
import { PrivateSwapEvent } from '@app/features/privacy/providers/shared-privacy-providers/models/private-event';
import { PrivateActionButtonService } from '@app/features/privacy/providers/shared-privacy-providers/services/private-action-button/private-action-button.service';
import { BlockchainName, TokenAmount } from '@cryptorubic/core';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { firstValueFrom, startWith, takeUntil, tap } from 'rxjs';
import { RubicError } from '@app/core/errors/models/rubic-error';
import { RubicSdkError, Web3Pure } from '@cryptorubic/web3';
import InsufficientFundsError from '@app/core/errors/models/instant-trade/insufficient-funds-error';
import { ErrorsService } from '@app/core/errors/errors.service';
import { AuthService } from '@app/core/services/auth/auth.service';
import { PrivateStatisticsService } from '../../../shared-privacy-providers/services/private-statistics/private-statistics.service';
import { PRIVATE_TRADE_TYPE } from '@app/features/privacy/constants/private-trade-types';
import { TokensBalanceService } from '@app/core/services/tokens/tokens-balance.service';
import { PrivateSwapWindowService } from '../../../shared-privacy-providers/services/private-swap-window/private-swap-window.service';
import { compareTokens } from '@app/shared/utils/utils';

@Component({
  selector: 'app-clearswap-swap-page',
  templateUrl: './clearswap-swap-page.component.html',
  styleUrls: ['./clearswap-swap-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TuiDestroyService]
})
export class ClearswapSwapPageComponent implements OnInit {
  public readonly receiverCtrl = new FormControl<string>('', {
    asyncValidators: [isReceiverCorrect()]
  });

  public readonly quoteAdapter = new ClearswapQuoteAdapter(
    this.clearswapSwapService,
    this.receiverCtrl,
    this.clearswapErrorService,
    this.notificationsService
  );

  public readonly clearswapFormConfig = clearswapFormConfig;

  constructor(
    private readonly clearswapSwapService: ClearswapSwapService,
    private readonly clearswapErrorService: ClearswapErrorService,
    private readonly privateActionButtonService: PrivateActionButtonService,
    private readonly notificationsService: NotificationsService,
    private readonly authService: AuthService,
    private readonly errorService: ErrorsService,
    private readonly privateStatisticsService: PrivateStatisticsService,
    private readonly tokensBalanceService: TokensBalanceService,
    private readonly privateSwapWindowService: PrivateSwapWindowService,
    @Self() private readonly destroy$: TuiDestroyService
  ) {}

  ngOnInit(): void {
    this.receiverCtrl.valueChanges
      .pipe(
        startWith(this.receiverCtrl.value),
        tap(address => {
          this.privateActionButtonService.setReceiverAddress(address);
        }),
        takeUntil(this.destroy$)
      )
      .subscribe();
  }

  public async swap({ swapInfo, loadingCallback, openPreview }: PrivateSwapEvent): Promise<void> {
    try {
      const fromToken = new TokenAmount({
        ...swapInfo.fromAsset,
        tokenAmount: swapInfo.fromAmount.actualValue
      });
      const userAddress = this.authService.userAddress;

      const balance = await this.tokensBalanceService.getAndUpdateTokenBalance(fromToken, 5);
      this.privateSwapWindowService.patchSwapInfo({
        fromAsset: {
          ...this.privateSwapWindowService.swapInfo.fromAsset,
          amount: balance
        }
      });
      if (!balance.gte(fromToken.tokenAmount)) {
        throw new InsufficientFundsError(fromToken.symbol);
      }

      const nativeToken = {
        address: Web3Pure.getNativeTokenAddress(fromToken.blockchain),
        blockchain: fromToken.blockchain
      };
      const preview$ = openPreview({
        steps: [
          {
            label: 'Swap',
            action: () =>
              this.clearswapSwapService
                .transfer(
                  swapInfo.tradeId,
                  fromToken as TokenAmount<BlockchainName>,
                  swapInfo.toAsset,
                  this.receiverCtrl.value
                )
                .then(async () => {
                  this.privateStatisticsService.saveAction(
                    'TRANSFER',
                    PRIVATE_TRADE_TYPE.CLEARSWAP,
                    userAddress,
                    fromToken.address,
                    fromToken.stringWeiAmount,
                    fromToken.blockchain
                  );

                  const [newBalanceFrom, newBalanceTo] = await Promise.all([
                    this.tokensBalanceService.getAndUpdateTokenBalance(fromToken, 5),
                    this.tokensBalanceService.getAndUpdateTokenBalance(swapInfo.toAsset, 5)
                  ]);
                  if (compareTokens(this.privateSwapWindowService.swapInfo.fromAsset, fromToken)) {
                    this.privateSwapWindowService.patchSwapInfo({
                      fromAsset: {
                        ...this.privateSwapWindowService.swapInfo.fromAsset,
                        amount: newBalanceFrom
                      }
                    });
                  }
                  if (
                    compareTokens(this.privateSwapWindowService.swapInfo.toAsset, swapInfo.toAsset)
                  ) {
                    this.privateSwapWindowService.patchSwapInfo({
                      fromAsset: {
                        ...this.privateSwapWindowService.swapInfo.toAsset,
                        amount: newBalanceTo
                      }
                    });
                  }

                  if (
                    !Web3Pure.isNativeAddress(fromToken.blockchain, fromToken.address) &&
                    !Web3Pure.isNativeAddress(swapInfo.toAsset.blockchain, swapInfo.toAsset.address)
                  ) {
                    this.tokensBalanceService.getAndUpdateTokenBalance(nativeToken, 5);
                  }
                })
                .catch(async () => {
                  const nativeBalance = await this.tokensBalanceService.getAndUpdateTokenBalance(
                    nativeToken,
                    5
                  );
                  if (
                    compareTokens(this.privateSwapWindowService.swapInfo.fromAsset, nativeToken)
                  ) {
                    this.privateSwapWindowService.patchSwapInfo({
                      fromAsset: {
                        ...this.privateSwapWindowService.swapInfo.fromAsset,
                        amount: nativeBalance
                      }
                    });
                  }
                })
          }
        ]
      });
      await firstValueFrom(preview$);
    } catch (error) {
      if (error instanceof RubicError || error instanceof RubicSdkError) {
        this.errorService.catch(error);
      } else {
        this.notificationsService.showError('Something went wrong. Please, try again later.');
      }
    } finally {
      loadingCallback();
    }
  }
}
