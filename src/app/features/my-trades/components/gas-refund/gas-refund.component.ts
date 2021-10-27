import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject } from '@angular/core';
import { EMPTY, forkJoin, Observable, Subscription } from 'rxjs';
import { Promotion } from '@features/my-trades/models/promotion';
import { GasRefundService } from '@features/my-trades/services/gas-refund.service';
import { watch } from '@taiga-ui/cdk';
import { ScannerLinkPipe } from '@shared/pipes/scanner-link.pipe';
import { BLOCKCHAIN_NAME } from '@shared/models/blockchain/BLOCKCHAIN_NAME';
import ADDRESS_TYPE from '@shared/models/blockchain/ADDRESS_TYPE';
import { TuiNotification } from '@taiga-ui/core';
import { NotificationsService } from '@core/services/notifications/notifications.service';
import { TranslateService } from '@ngx-translate/core';
import { ErrorsService } from '@core/errors/errors.service';
import { MyTradesService } from '@features/my-trades/services/my-trades.service';
import { catchError } from 'rxjs/operators';
import { WINDOW } from '@ng-web-apis/common';
import { switchTap } from '@shared/utils/utils';

/**
 * Panel with cards intended for gas refund.
 */
@Component({
  selector: 'app-gas-refund',
  templateUrl: './gas-refund.component.html',
  styleUrls: ['./gas-refund.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GasRefundComponent {
  private notificationSubscription$: Subscription;

  public readonly userPromotions$: Observable<Promotion[]>;

  public isLoading = false;

  public refundInProgressIds: number[] = [];

  constructor(
    private readonly gasRefundService: GasRefundService,
    private readonly cdr: ChangeDetectorRef,
    private readonly scannerLinkPipe: ScannerLinkPipe,
    private readonly notificationsService: NotificationsService,
    private readonly translateService: TranslateService,
    private readonly errorsService: ErrorsService,
    private readonly myTradesService: MyTradesService,
    @Inject(WINDOW) private readonly window: Window
  ) {
    this.userPromotions$ = gasRefundService.userPromotions$;
  }

  public refreshRefunds() {
    this.isLoading = true;
    this.gasRefundService
      .updateUserPromotions()
      .pipe(watch(this.cdr))
      .subscribe(() => (this.isLoading = false));
  }

  public isButtonDisabled(refundDate: Date): boolean {
    return refundDate > new Date();
  }

  public openInExplorer(hash: string, blockchain: BLOCKCHAIN_NAME): void {
    const link = this.scannerLinkPipe.transform(hash, blockchain, ADDRESS_TYPE.TRANSACTION);
    this.window.open(link, '_blank').focus();
  }

  public onRefundClick(promoId: number): void {
    const onTransactionHash = () => {
      this.notificationSubscription$ = this.notify('progress');
    };
    this.refundInProgressIds = this.refundInProgressIds.concat(promoId);
    this.gasRefundService
      .refund(promoId, onTransactionHash)
      .pipe(
        catchError(err => {
          this.errorsService.catchAnyError(err);
          this.notificationSubscription$?.unsubscribe();
          return EMPTY;
        }),
        switchTap(() =>
          forkJoin([
            this.gasRefundService.updateUserPromotions(),
            this.myTradesService.updateTableTrades()
          ])
        )
      )
      .subscribe(() => {
        this.notificationSubscription$?.unsubscribe();
        this.notify('complete');
      })
      .add(() => {
        this.refundInProgressIds = this.refundInProgressIds.filter(elem => elem !== promoId);
        this.cdr.markForCheck();
      });
  }

  private notify(tradeStatus: 'progress' | 'complete'): Subscription {
    const notificationsData = {
      progress: {
        message: 'gasRefund.notifications.progress.message',
        label: 'gasRefund.notifications.progress.label',
        tuiStatus: TuiNotification.Info,
        autoClose: false
      },
      complete: {
        message: 'gasRefund.notifications.complete.message',
        label: 'gasRefund.notifications.complete.label',
        tuiStatus: TuiNotification.Success,
        autoClose: 5000
      }
    };
    const notificationData = notificationsData[tradeStatus];

    return this.notificationsService.show(this.translateService.instant(notificationData.message), {
      label: this.translateService.instant(notificationData.label),
      status: notificationData.tuiStatus,
      autoClose: notificationData.autoClose
    });
  }
}
