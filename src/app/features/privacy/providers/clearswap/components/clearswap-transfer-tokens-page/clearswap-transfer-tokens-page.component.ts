import { FormControl } from '@angular/forms';
/* eslint-disable rxjs/no-exposed-subjects */
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
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
  Subject,
  switchMap,
  throwError,
  timer
} from 'rxjs';
import { ClearswapErrorService } from '../../services/clearswap-error.service';
import { NotificationsService } from '@app/core/services/notifications/notifications.service';

@Component({
  selector: 'app-clearswap-transfer-tokens-page',
  templateUrl: './clearswap-transfer-tokens-page.component.html',
  styleUrls: ['./clearswap-transfer-tokens-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    { provide: ToAssetsService, useClass: ClearswapPrivateAssetsService },
    { provide: TokensFacadeService, useClass: ClearswapTokensFacadeService }
  ]
})
export class ClearswapTransferTokensPageComponent implements OnInit {
  public readonly nextTransfer$ = new Subject<PrivateEvent>();

  public readonly receiverCtrl = new FormControl<string>('');

  constructor(
    private readonly clearswapSwapService: ClearswapSwapService,
    private readonly clearswapErrorService: ClearswapErrorService,
    private readonly notificationsService: NotificationsService
  ) {}

  ngOnInit(): void {
    this.nextTransfer$.pipe(switchMap(event => this.transfer(event))).subscribe();
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
          return openPreview({
            dstTokenAmount,
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
