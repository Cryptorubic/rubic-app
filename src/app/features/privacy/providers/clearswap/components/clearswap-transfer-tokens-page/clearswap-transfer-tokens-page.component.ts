/* eslint-disable rxjs/no-exposed-subjects */
import { FormControl } from '@angular/forms';
import { ChangeDetectionStrategy, Component, OnInit, Self } from '@angular/core';
import { TokensFacadeService } from '@app/core/services/tokens/tokens-facade.service';
import { ClearswapPrivateAssetsService } from '@app/features/privacy/providers/clearswap/services/clearswap-private-assets.service';
import { ClearswapSwapService } from '@app/features/privacy/providers/clearswap/services/clearswap-swap.service';
import { ClearswapTokensFacadeService } from '@app/features/privacy/providers/clearswap/services/clearswap-tokens-facade.service';
import { PrivateEvent } from '@app/features/privacy/providers/shared-privacy-providers/models/private-event';
import { ToAssetsService } from '@app/features/trade/components/assets-selector/services/to-assets.service';

import { Token } from '@app/shared/models/tokens/token';
import { BlockchainName, TokenAmount } from '@cryptorubic/core';
import {
  catchError,
  defer,
  finalize,
  Observable,
  of,
  retry,
  startWith,
  Subject,
  switchMap,
  takeUntil,
  tap,
  throwError,
  timer
} from 'rxjs';
import { ClearswapErrorService } from '../../services/clearswap-error.service';
import { NotificationsService } from '@app/core/services/notifications/notifications.service';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { PrivateActionButtonService } from '@app/features/privacy/providers/shared-privacy-providers/services/private-action-button/private-action-button.service';
import { clearswapFormConfig } from '@app/features/privacy/providers/clearswap/constants/clearswap-form-config';
import { isReceiverCorrect } from '@app/features/privacy/providers/clearswap/constants/receiver-validator';

@Component({
  selector: 'app-clearswap-transfer-tokens-page',
  templateUrl: './clearswap-transfer-tokens-page.component.html',
  styleUrls: ['./clearswap-transfer-tokens-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    TuiDestroyService,
    { provide: ToAssetsService, useClass: ClearswapPrivateAssetsService },
    { provide: TokensFacadeService, useClass: ClearswapTokensFacadeService }
  ]
})
export class ClearswapTransferTokensPageComponent implements OnInit {
  public readonly nextTransfer$ = new Subject<PrivateEvent>();

  public readonly receiverCtrl = new FormControl<string>('', {
    asyncValidators: [isReceiverCorrect()]
  });

  public readonly clearswapFormConfig = clearswapFormConfig;

  constructor(
    private readonly clearswapSwapService: ClearswapSwapService,
    private readonly clearswapErrorService: ClearswapErrorService,
    private readonly notificationsService: NotificationsService,
    private readonly privateActionButtonService: PrivateActionButtonService,
    @Self() private readonly destroy$: TuiDestroyService
  ) {}

  ngOnInit(): void {
    this.nextTransfer$
      .pipe(
        switchMap(event => this.transfer(event)),
        takeUntil(this.destroy$)
      )
      .subscribe();

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

  private transfer({ token, loadingCallback, openPreview }: PrivateEvent): Observable<void> {
    return defer(() =>
      this.clearswapSwapService.quote(
        token as TokenAmount<BlockchainName>,
        { ...token } as Token,
        this.receiverCtrl.value
      )
    ).pipe(
      retry({
        count: 5,
        delay: (error, retryCount) => {
          console.error('quote error:', error, 'retry #', retryCount);
          if (error?.message?.includes('Cannot retrieve information about')) {
            return timer(5000);
          }
          return throwError(() => error);
        }
      }),
      switchMap(quoteResponse => {
        if ('tradeId' in quoteResponse) {
          const { tradeId, tokenAmount: dstTokenAmount } = quoteResponse;
          const displayAmount =
            token.tokenAmount.minus(dstTokenAmount).toString() + ' ' + token.symbol;
          return openPreview({
            dstTokenAmount,
            displayAmount,
            steps: [
              {
                label: 'Transfer tokens',
                action: () =>
                  this.clearswapSwapService.transfer(
                    tradeId,
                    token as TokenAmount<BlockchainName>,
                    { ...token } as Token,
                    this.receiverCtrl.value
                  )
              }
            ]
          });
        }

        this.clearswapErrorService.setTradeError(quoteResponse.tradeError);
        return of(null);
      }),
      catchError(() => {
        this.notificationsService.showError('Something went wrong. Please, try again later.');
        return of(null);
      }),
      finalize(() => {
        loadingCallback();
      })
    );
  }
}
