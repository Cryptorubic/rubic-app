import { ChangeDetectionStrategy, Component, Self } from '@angular/core';
import { FormControl } from '@angular/forms';
import { HinkalPrivateAssetsService } from '../../services/hinkal-private-assets.service';
import { TokensFacadeService } from '@app/core/services/tokens/tokens-facade.service';
import { PrivateEvent } from '../../../shared-privacy-providers/models/private-event';
import { HinkalRevealFacadeService } from '../../services/hinkal-reveal-facade.service';
import { HinkalFacadeService } from '../../services/hinkal-sdk/hinkal-facade.service';
import { EvmBlockchainName, TokenAmount } from '@cryptorubic/core';
import { firstValueFrom, map, startWith, takeUntil, tap } from 'rxjs';
import { HINKAL_WARNINGS } from '../../constants/hinkal-preswap-warnings';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { PrivateActionButtonService } from '../../../shared-privacy-providers/services/private-action-button/private-action-button.service';
import { HINKAL_DEFAULT_CREATION_CONFIG } from '../../constants/hinkal-default-creation-config';
import { ToAssetsService } from '@app/features/trade/components/assets-selector/services/to-assets.service';

@Component({
  selector: 'app-hinkal-reveal-tokens-page',
  templateUrl: './hinkal-reveal-tokens-page.component.html',
  styleUrls: ['./hinkal-reveal-tokens-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    TuiDestroyService,
    { provide: ToAssetsService, useClass: HinkalPrivateAssetsService },
    { provide: TokensFacadeService, useClass: HinkalRevealFacadeService }
  ]
})
export class HinkalRevealTokensPageComponent {
  public readonly receiverCtrl = new FormControl<string>('');

  public readonly creationConfig$ = this.hinkalFacadeService.activeChain$.pipe(
    map(chain => {
      return {
        ...HINKAL_DEFAULT_CREATION_CONFIG,
        withReceiver: true,
        receiverPlaceholder: 'Enter receiver’s EVM wallet address',
        assetsSelectorConfig: {
          ...HINKAL_DEFAULT_CREATION_CONFIG.assetsSelectorConfig,
          listType: chain,
          platformLoading$: this.hinkalFacadeService.balanceLoading$
        }
      };
    })
  );

  constructor(
    private readonly hinkalFacadeService: HinkalFacadeService,
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

  public async reveal({ token, loadingCallback, openPreview }: PrivateEvent): Promise<void> {
    try {
      const preview$ = openPreview({
        steps: [
          {
            label: 'Unshield',
            action: () =>
              this.hinkalFacadeService.withdraw(
                token as TokenAmount<EvmBlockchainName>,
                this.receiverCtrl.value
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
