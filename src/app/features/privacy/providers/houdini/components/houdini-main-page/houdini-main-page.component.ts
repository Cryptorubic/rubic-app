import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, Self } from '@angular/core';
import { TokensFacadeService } from '@app/core/services/tokens/tokens-facade.service';
import { HoudiniPrivateAssetsService } from '@app/features/privacy/providers/houdini/services/houdini-private-assets.service';
import { HoudiniSwapService } from '@app/features/privacy/providers/houdini/services/houdini-swap.service';
import { HoudiniTokensFacadeService } from '@app/features/privacy/providers/houdini/services/houdini-tokens-facade.service';
import { HoudiniQuoteAdapter } from '@app/features/privacy/providers/houdini/utils/houdini-quote-adapter';
import { PrivateSwapEvent } from '@app/features/privacy/providers/shared-privacy-providers/models/private-event';
import { PrivatePageTypeService } from '@app/features/privacy/providers/shared-privacy-providers/services/private-page-type/private-page-type.service';
import { FromAssetsService } from '@app/features/trade/components/assets-selector/services/from-assets.service';
import { ToAssetsService } from '@app/features/trade/components/assets-selector/services/to-assets.service';
import { TokenAmount } from '@cryptorubic/core';
import { firstValueFrom, startWith, Subscription, takeUntil, tap } from 'rxjs';
import { HoudiniErrorService } from '../../services/houdini-error.service';
import { HoudiniPrivateActionButtonService } from '../../services/houdini-private-action-button.service';
import { PrivateActionButtonService } from '../../../shared-privacy-providers/services/private-action-button/private-action-button.service';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { NotificationsService } from '@app/core/services/notifications/notifications.service';
import { houdiniFormConfig } from '../../constants/form-config';
import { FormControl } from '@angular/forms';
import { WalletConnectorService } from '@app/core/services/wallets/wallet-connector-service/wallet-connector.service';

@Component({
  selector: 'app-houdini-main-page',
  templateUrl: './houdini-main-page.component.html',
  styleUrls: ['./houdini-main-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    TuiDestroyService,
    { provide: FromAssetsService, useClass: HoudiniPrivateAssetsService },
    { provide: ToAssetsService, useClass: HoudiniPrivateAssetsService },
    { provide: TokensFacadeService, useClass: HoudiniTokensFacadeService },
    { provide: PrivateActionButtonService, useClass: HoudiniPrivateActionButtonService }
  ]
})
export class HoudiniMainPageComponent implements OnInit, OnDestroy {
  public readonly receiverCtrl = new FormControl<string>('');

  public readonly quoteAdapter = new HoudiniQuoteAdapter(
    this.houdiniSwapService,
    this.receiverCtrl,
    this.houdiniErrorService,
    this.notificationsService
  );

  public readonly formConfig = houdiniFormConfig;

  public readonly depositTradeData$ = this.houdiniSwapService.depositTradeData$;

  public readonly depositTradeStatus$ = this.houdiniSwapService.depositTradeStatus$;

  private _walletSubscription: Subscription;

  constructor(
    private readonly houdiniSwapService: HoudiniSwapService,
    private readonly privatePageTypeService: PrivatePageTypeService,
    private readonly houdiniErrorService: HoudiniErrorService,
    private readonly privateActionButtonService: PrivateActionButtonService,
    private readonly notificationsService: NotificationsService,
    private readonly walletConnectorService: WalletConnectorService,
    @Self() private readonly destroy$: TuiDestroyService
  ) {
    this.privatePageTypeService.activePage = {
      type: 'swap',
      label: 'Swap'
    };
  }

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

  ngOnDestroy(): void {
    this.houdiniSwapService.subscriptions.forEach(s => s?.unsubscribe());
    this._walletSubscription?.unsubscribe();
  }

  public async swap({ swapInfo, loadingCallback, openPreview }: PrivateSwapEvent): Promise<void> {
    try {
      const fromToken = new TokenAmount({
        ...swapInfo.fromAsset,
        tokenAmount: swapInfo.fromAmount.actualValue
      });

      const preview$ = openPreview({
        steps: [
          {
            label: 'Swap',
            action: () => this.houdiniSwapService.swap(fromToken)
          }
        ]
      });
      await firstValueFrom(preview$);
    } finally {
      loadingCallback();
    }
  }
}
