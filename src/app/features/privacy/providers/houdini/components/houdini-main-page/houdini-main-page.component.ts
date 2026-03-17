import { ChangeDetectionStrategy, Component, OnInit, Self } from '@angular/core';
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
import { firstValueFrom, startWith, takeUntil, tap } from 'rxjs';
import { HoudiniErrorService } from '../../services/houdini-error.service';
import { HoudiniPrivateActionButtonService } from '../../services/houdini-private-action-button.service';
import { PrivateActionButtonService } from '../../../shared-privacy-providers/services/private-action-button/private-action-button.service';
import { FormControl } from '@angular/forms';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { NotificationsService } from '@app/core/services/notifications/notifications.service';

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
export class HoudiniMainPageComponent implements OnInit {
  public readonly receiverCtrl = new FormControl<string>('');

  public readonly quoteAdapter = new HoudiniQuoteAdapter(
    this.houdiniSwapService,
    this.receiverCtrl,
    this.houdiniErrorService,
    this.notificationsService
  );

  constructor(
    private readonly houdiniSwapService: HoudiniSwapService,
    private readonly privatePageTypeService: PrivatePageTypeService,
    private readonly houdiniErrorService: HoudiniErrorService,
    private readonly privateActionButtonService: PrivateActionButtonService,
    private readonly notificationsService: NotificationsService,
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

  public async swap({ swapInfo, loadingCallback, openPreview }: PrivateSwapEvent): Promise<void> {
    try {
      const _ = new TokenAmount({
        ...swapInfo.fromAsset,
        tokenAmount: swapInfo.fromAmount.actualValue
      });

      const preview$ = openPreview({
        steps: [
          {
            label: 'Swap',
            action: () => this.houdiniSwapService.swap()
          }
        ]
      });
      await firstValueFrom(preview$);
    } finally {
      loadingCallback();
    }
  }
}
