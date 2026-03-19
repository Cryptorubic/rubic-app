import { ChangeDetectionStrategy, Component, OnInit, Self } from '@angular/core';
import { FormControl } from '@angular/forms';
import { NotificationsService } from '@app/core/services/notifications/notifications.service';
import { TokensFacadeService } from '@app/core/services/tokens/tokens-facade.service';
import { isReceiverCorrect } from '@app/features/privacy/providers/clearswap/constants/receiver-validator';
import { clearswapFormConfig } from '@app/features/privacy/providers/clearswap/constants/clearswap-form-config';
import { ClearswapErrorService } from '@app/features/privacy/providers/clearswap/services/clearswap-error.service';
import { ClearswapPrivateAssetsService } from '@app/features/privacy/providers/clearswap/services/clearswap-private-assets.service';
import { ClearswapSwapService } from '@app/features/privacy/providers/clearswap/services/clearswap-swap.service';
import { ClearswapTokensFacadeService } from '@app/features/privacy/providers/clearswap/services/clearswap-tokens-facade.service';
import { ClearswapQuoteAdapter } from '@app/features/privacy/providers/clearswap/utils/clearswap-quote-adapter';
import { PrivateSwapEvent } from '@app/features/privacy/providers/shared-privacy-providers/models/private-event';
import { PrivateActionButtonService } from '@app/features/privacy/providers/shared-privacy-providers/services/private-action-button/private-action-button.service';
import { FromAssetsService } from '@app/features/trade/components/assets-selector/services/from-assets.service';
import { ToAssetsService } from '@app/features/trade/components/assets-selector/services/to-assets.service';
import { BlockchainName, TokenAmount } from '@cryptorubic/core';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { firstValueFrom, startWith, takeUntil, tap } from 'rxjs';

@Component({
  selector: 'app-clearswap-swap-page',
  templateUrl: './clearswap-swap-page.component.html',
  styleUrls: ['./clearswap-swap-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    TuiDestroyService,
    { provide: FromAssetsService, useClass: ClearswapPrivateAssetsService },
    { provide: ToAssetsService, useClass: ClearswapPrivateAssetsService },
    { provide: TokensFacadeService, useClass: ClearswapTokensFacadeService }
  ]
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

      const preview$ = openPreview({
        steps: [
          {
            label: 'Swap',
            action: () =>
              this.clearswapSwapService.transfer(
                swapInfo.tradeId,
                fromToken as TokenAmount<BlockchainName>,
                swapInfo.toAsset,
                this.receiverCtrl.value
              )
          }
        ]
      });
      await firstValueFrom(preview$);
    } finally {
      loadingCallback();
    }
  }
}
