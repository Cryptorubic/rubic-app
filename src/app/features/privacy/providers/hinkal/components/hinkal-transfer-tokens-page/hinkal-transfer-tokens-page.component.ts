import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ToAssetsService } from '@app/features/trade/components/assets-selector/services/to-assets.service';
import { HinkalPrivateAssetsService } from '../../services/hinkal-private-assets.service';
import { HinkalFacadeService } from '../../services/hinkal-sdk/hinkal-facade.service';
import { PrivateEvent } from '../../../shared-privacy-providers/models/private-event';

import { EvmBlockchainName, TokenAmount } from '@cryptorubic/core';
import { firstValueFrom } from 'rxjs';
import { TokensFacadeService } from '@app/core/services/tokens/tokens-facade.service';
import { HinkalRevealFacadeService } from '../../services/hinkal-reveal-facade.service';

@Component({
  selector: 'app-hinkal-transfer-tokens-page',
  templateUrl: './hinkal-transfer-tokens-page.component.html',
  styleUrls: ['./hinkal-transfer-tokens-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    { provide: ToAssetsService, useClass: HinkalPrivateAssetsService },
    { provide: TokensFacadeService, useClass: HinkalRevealFacadeService }
  ]
})
export class HinkalTransferTokensPageComponent {
  public readonly receiverCtrl = new FormControl<string>('');

  constructor(private readonly hinkalFacadeService: HinkalFacadeService) {}

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
        ]
      });

      await firstValueFrom(preview$);
    } finally {
      loadingCallback();
    }
  }
}
