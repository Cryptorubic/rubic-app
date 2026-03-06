import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ToAssetsService } from '@app/features/trade/components/assets-selector/services/to-assets.service';
import { HinkalPrivateAssetsService } from '../../services/hinkal-private-assets.service';
import { HinkalFacadeService } from '../../services/hinkal-sdk/hinkal-facade.service';
import { PrivateEvent } from '../../../shared-privacy-providers/models/private-event';
import { TargetNetworkAddressService } from '@app/features/trade/services/target-network-address-service/target-network-address.service';
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
  constructor(
    private readonly hinkalFacadeService: HinkalFacadeService,
    private readonly targetAddressService: TargetNetworkAddressService
  ) {}

  public async transfer({ token, loadingCallback, openPreview }: PrivateEvent): Promise<void> {
    try {
      const preview$ = openPreview({
        steps: [
          {
            label: 'Transfer tokens',
            action: () =>
              this.hinkalFacadeService.transfer(
                token as TokenAmount<EvmBlockchainName>,
                this.targetAddressService.address
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
