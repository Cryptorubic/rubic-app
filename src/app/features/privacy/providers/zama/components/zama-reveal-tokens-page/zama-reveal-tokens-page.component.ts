import { ChangeDetectionStrategy, Component, Self } from '@angular/core';
import { FormControl } from '@angular/forms';
import { PrivateEvent } from '../../../shared-privacy-providers/models/private-event';
import { ToAssetsService } from '@app/features/trade/components/assets-selector/services/to-assets.service';
import { ZamaPrivateAssetsService } from '../../services/zama-private-assets.service';
import { TokensFacadeService } from '@app/core/services/tokens/tokens-facade.service';
import { ZamaRevealFacadeService } from '../../services/zama-reveal-tokens-facade.service';
import { ZamaFacadeService } from '../../services/zama-sdk/zama-facade.service';
import { EvmBlockchainName, TokenAmount } from '@cryptorubic/core';

import { firstValueFrom, startWith, takeUntil, tap } from 'rxjs';
import { PrivateActionButtonService } from '../../../shared-privacy-providers/services/private-action-button/private-action-button.service';
import { TuiDestroyService } from '@taiga-ui/cdk';

@Component({
  selector: 'app-zama-reveal-tokens-page',
  templateUrl: './zama-reveal-tokens-page.component.html',
  styleUrls: ['./zama-reveal-tokens-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    TuiDestroyService,
    { provide: ToAssetsService, useClass: ZamaPrivateAssetsService },
    { provide: TokensFacadeService, useClass: ZamaRevealFacadeService }
  ]
})
export class ZamaRevealTokensPageComponent {
  public readonly receiverCtrl = new FormControl<string>('');

  constructor(
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

  public async reveal({ token, loadingCallback, openPreview }: PrivateEvent): Promise<void> {
    try {
      const preview$ = openPreview({
        steps: [
          {
            label: 'Unshield',
            action: () =>
              this.zamaFacadeService.unwrap(
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
