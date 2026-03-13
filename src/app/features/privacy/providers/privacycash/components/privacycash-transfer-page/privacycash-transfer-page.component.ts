import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormControl } from '@angular/forms';
import { PrivateEvent } from '../../../shared-privacy-providers/models/private-event';

import { PrivacycashSwapService } from '../../services/privacy-cash-swap.service';
import { firstValueFrom } from 'rxjs';
import { TokensFacadeService } from '@app/core/services/tokens/tokens-facade.service';
import { ToAssetsService } from '@app/features/trade/components/assets-selector/services/to-assets.service';
import { PrivacycashPrivateAssetsService } from '../../services/common/assets-services/privacycash-private-assets.service';
import { PrivacycashPrivateTokensFacadeService } from '../../services/common/token-facades/privacycash-private-tokens-facade.service';

@Component({
  selector: 'app-privacycash-transfer-page',
  templateUrl: './privacycash-transfer-page.component.html',
  styleUrls: ['./privacycash-transfer-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    { provide: ToAssetsService, useClass: PrivacycashPrivateAssetsService },
    { provide: TokensFacadeService, useClass: PrivacycashPrivateTokensFacadeService }
  ]
})
export class PrivacycashTransferPageComponent {
  private readonly privacycashSwapService = inject(PrivacycashSwapService);

  public readonly receiverCtrl = new FormControl<string>('');

  public async transfer({ token, loadingCallback, openPreview }: PrivateEvent): Promise<void> {
    try {
      const receiverAddr = this.receiverCtrl.value;
      const preview$ = openPreview({
        steps: [
          {
            label: 'Transfer tokens',
            action: () => this.privacycashSwapService.transfer(token, receiverAddr)
          }
        ]
      });
      await firstValueFrom(preview$);
    } finally {
      loadingCallback();
    }
  }
}
