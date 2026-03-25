import { ChangeDetectionStrategy, Component, Self } from '@angular/core';
import { FormControl } from '@angular/forms';
import { PrivateEvent } from '../../../shared-privacy-providers/models/private-event';
import { TokensFacadeService } from '@app/core/services/tokens/tokens-facade.service';
import { ZamaPrivateAssetsService } from '../../services/zama-private-assets.service';
import { ZamaRevealFacadeService } from '../../services/zama-reveal-tokens-facade.service';
import { ZamaFacadeService } from '../../services/zama-sdk/zama-facade.service';
import { EvmBlockchainName, TokenAmount } from '@cryptorubic/core';

import { firstValueFrom, startWith, takeUntil, tap } from 'rxjs';
import { PrivateActionButtonService } from '../../../shared-privacy-providers/services/private-action-button/private-action-button.service';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { PrivateTransferFormConfig } from '../../../shared-privacy-providers/models/swap-form-types';
import { ToAssetsService } from '@app/features/trade/components/assets-selector/services/to-assets.service';

@Component({
  selector: 'app-zama-transfer-tokens-page',
  templateUrl: './zama-transfer-tokens-page.component.html',
  styleUrls: ['./zama-transfer-tokens-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    TuiDestroyService,
    { provide: ToAssetsService, useClass: ZamaPrivateAssetsService },
    { provide: TokensFacadeService, useClass: ZamaRevealFacadeService }
  ]
})
export class ZamaTransferTokensPageComponent {
  public readonly receiverCtrl = new FormControl<string>('');

  public readonly creationConfig: PrivateTransferFormConfig = {
    withActionButton: true,
    withReceiver: true,
    withSrcAmount: true,
    withMaxBtn: true,
    receiverPlaceholder: 'Enter receiver’s EVM wallet address'
  };

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

  public async transfer({ token, loadingCallback, openPreview }: PrivateEvent): Promise<void> {
    try {
      const steps = await this.zamaFacadeService.prepareTransferSteps(
        token as TokenAmount<EvmBlockchainName>,
        this.receiverCtrl.value
      );

      const preview$ = openPreview({ steps });

      await firstValueFrom(preview$);
    } finally {
      loadingCallback();
    }
  }
}
