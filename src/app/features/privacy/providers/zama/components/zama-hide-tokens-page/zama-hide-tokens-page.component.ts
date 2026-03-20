import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { PrivateEvent } from '../../../shared-privacy-providers/models/private-event';
import { FromAssetsService } from '@app/features/trade/components/assets-selector/services/from-assets.service';
import { ZamaPrivateAssetsService } from '../../services/zama-private-assets.service';
import { TokensFacadeService } from '@app/core/services/tokens/tokens-facade.service';
import { ZamaHideTokensFacadeService } from '../../services/zama-hide-tokens-facade.service';
import { firstValueFrom } from 'rxjs';
import { ZamaFacadeService } from '../../services/zama-sdk/zama-facade.service';
import { EvmBlockchainName, TokenAmount } from '@cryptorubic/core';
import { PrivateShieldFormConfig } from '../../../shared-privacy-providers/models/swap-form-types';

@Component({
  selector: 'app-zama-hide-tokens-page',
  templateUrl: './zama-hide-tokens-page.component.html',
  styleUrls: ['./zama-hide-tokens-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
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

  public readonly creationConfig: PrivateShieldFormConfig = {
    withActionButton: true,
    withReceiver: false,
    withSrcAmount: true,
    withMaxBtn: true
  };

  constructor(private readonly zamaFacadeService: ZamaFacadeService) {}

  public async hide({ token, loadingCallback, openPreview }: PrivateEvent): Promise<void> {
    try {
      const steps = await this.zamaFacadeService.prepareWrapSteps(
        token as TokenAmount<EvmBlockchainName>
      );

      const preview$ = openPreview({ steps });

      await firstValueFrom(preview$);
    } finally {
      loadingCallback();
    }
  }
}
