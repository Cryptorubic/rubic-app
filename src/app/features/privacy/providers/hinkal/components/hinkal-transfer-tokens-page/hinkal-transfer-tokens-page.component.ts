import { ChangeDetectionStrategy, Component, Self } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ToAssetsService } from '@app/features/trade/components/assets-selector/services/to-assets.service';
import { HinkalPrivateAssetsService } from '../../services/hinkal-private-assets.service';
import { HinkalFacadeService } from '../../services/hinkal-sdk/hinkal-facade.service';
import { PrivateEvent } from '../../../shared-privacy-providers/models/private-event';

import { EvmBlockchainName, TokenAmount } from '@cryptorubic/core';
import { firstValueFrom, startWith, takeUntil, tap } from 'rxjs';
import { TokensFacadeService } from '@app/core/services/tokens/tokens-facade.service';
import { HinkalRevealFacadeService } from '../../services/hinkal-reveal-facade.service';
import { HINKAL_WARNINGS } from '../../constants/hinkal-preswap-warnings';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { PrivateActionButtonService } from '../../../shared-privacy-providers/services/private-action-button/private-action-button.service';

@Component({
  selector: 'app-hinkal-transfer-tokens-page',
  templateUrl: './hinkal-transfer-tokens-page.component.html',
  styleUrls: ['./hinkal-transfer-tokens-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    TuiDestroyService,
    { provide: ToAssetsService, useClass: HinkalPrivateAssetsService },
    { provide: TokensFacadeService, useClass: HinkalRevealFacadeService }
  ]
})
export class HinkalTransferTokensPageComponent {
  public readonly receiverCtrl = new FormControl<string>('');

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

  public async transfer({ token, loadingCallback, openPreview }: PrivateEvent): Promise<void> {
    try {
      const preview$ = openPreview({
        steps: [
          {
            label: 'Transfer tokens',
            action: () =>
              this.hinkalFacadeService.transfer(
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
