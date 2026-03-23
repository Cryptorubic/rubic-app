import { ChangeDetectionStrategy, Component, Self } from '@angular/core';
import { FormControl } from '@angular/forms';
import { PrivateSwapEvent } from '../../../shared-privacy-providers/models/private-event';
import { HinkalQuoteAdapter } from '../../services/hinkal-sdk/utils/hinkal-quote-adapter';
import { EvmBlockchainName, Token, TokenAmount } from '@cryptorubic/core';
import { HinkalFacadeService } from '../../services/hinkal-sdk/hinkal-facade.service';
import { firstValueFrom, startWith, takeUntil, tap } from 'rxjs';
import { HinkalPrivateAssetsService } from '../../services/hinkal-private-assets.service';
import { NotificationsService } from '@app/core/services/notifications/notifications.service';
import { TokensFacadeService } from '@app/core/services/tokens/tokens-facade.service';
import { HinkalSwapTokensFacadeService } from '../../services/hinkal-swap-tokens-facade.service';
import { HINKAL_WARNINGS } from '../../constants/hinkal-preswap-warnings';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { PrivateActionButtonService } from '../../../shared-privacy-providers/services/private-action-button/private-action-button.service';
import { FromAssetsService } from '@app/features/trade/components/assets-selector/services/from-assets.service';
import { HinkalWorkerService } from '../../services/hinkal-sdk/hinkal-worker.service';

@Component({
  selector: 'app-hinkal-swap-tokens-page',
  templateUrl: './hinkal-swap-tokens-page.component.html',
  styleUrls: ['./hinkal-swap-tokens-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    TuiDestroyService,
    { provide: FromAssetsService, useClass: HinkalPrivateAssetsService },
    { provide: TokensFacadeService, useClass: HinkalSwapTokensFacadeService }
  ]
})
export class HinkalSwapTokensPageComponent {
  public readonly receiverCtrl = new FormControl<string>('');

  constructor(
    private readonly workerService: HinkalWorkerService,
    private readonly hinkalFacadeService: HinkalFacadeService,
    private readonly notificationsService: NotificationsService,
    @Self() private readonly destroy$: TuiDestroyService,
    private readonly privateActionButtonService: PrivateActionButtonService
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

  public readonly quoteAdapter = new HinkalQuoteAdapter(
    this.workerService,
    this.notificationsService
  );

  public async handleSwap({
    swapInfo,
    loadingCallback,
    openPreview
  }: PrivateSwapEvent): Promise<void> {
    try {
      const fromToken = new TokenAmount({
        ...swapInfo.fromAsset,
        weiAmount: Token.toWei(swapInfo.fromAmount.actualValue, swapInfo.fromAsset.decimals)
      });

      const toToken = new TokenAmount({
        ...swapInfo.toAsset,
        weiAmount: Token.toWei(swapInfo.toAmount.actualValue, swapInfo.toAsset.decimals)
      });

      const preview$ = openPreview({
        steps: [
          {
            label: 'Swap',
            action: () =>
              this.hinkalFacadeService.swap(
                fromToken as TokenAmount<EvmBlockchainName>,
                toToken as TokenAmount<EvmBlockchainName>
              )
          }
        ],
        warnings: HINKAL_WARNINGS
      });

      await firstValueFrom(preview$);
    } finally {
      loadingCallback();
    }
  }
}
