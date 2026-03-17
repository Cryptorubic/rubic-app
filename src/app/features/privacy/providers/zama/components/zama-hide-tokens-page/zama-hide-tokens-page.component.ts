import { ChangeDetectionStrategy, Component, Self } from '@angular/core';
import { FormControl } from '@angular/forms';
import { PrivateEvent } from '../../../shared-privacy-providers/models/private-event';
import { FromAssetsService } from '@app/features/trade/components/assets-selector/services/from-assets.service';
import { ZamaPrivateAssetsService } from '../../services/zama-private-assets.service';
import { TokensFacadeService } from '@app/core/services/tokens/tokens-facade.service';
import { ZamaHideTokensFacadeService } from '../../services/zama-hide-tokens-facade.service';
import { ZamaRevealFacadeService } from '../../services/zama-reveal-tokens-facade.service';
import { SwapsFormService } from '@app/features/trade/services/swaps-form/swaps-form.service';
import { firstValueFrom, map, startWith, takeUntil, tap } from 'rxjs';
import { ZamaFacadeService } from '../../services/zama-sdk/zama-facade.service';
import { EvmBlockchainName, TokenAmount } from '@cryptorubic/core';
import { PrivateActionButtonService } from '../../../shared-privacy-providers/services/private-action-button/private-action-button.service';
import { TuiDestroyService } from '@taiga-ui/cdk';

@Component({
  selector: 'app-zama-hide-tokens-page',
  templateUrl: './zama-hide-tokens-page.component.html',
  styleUrls: ['./zama-hide-tokens-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    TuiDestroyService,
    {
      provide: FromAssetsService,
      useClass: ZamaPrivateAssetsService
    },
    {
      provide: TokensFacadeService,
      useClass: ZamaHideTokensFacadeService
    }
  ]
})
export class ZamaHideTokensPageComponent {
  public readonly receiverCtrl = new FormControl<string>('');

  public readonly shieldedTokens$ = this.zamaRevealFacade
    .getTokensList('allChains', '', 'from', this.formService.inputValue)
    .pipe(map(tokens => tokens.filter(token => token.amount.gt(0))));

  constructor(
    private readonly zamaRevealFacade: ZamaRevealFacadeService,
    private readonly formService: SwapsFormService,
    private readonly zamaFacadeService: ZamaFacadeService,
    private readonly privateActionButtonService: PrivateActionButtonService,
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

  public async hide({ token, loadingCallback, openPreview }: PrivateEvent): Promise<void> {
    try {
      const preview$ = openPreview({
        steps: [
          {
            label: 'Shield',
            action: () =>
              this.zamaFacadeService.wrap(
                token as TokenAmount<EvmBlockchainName>,
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
