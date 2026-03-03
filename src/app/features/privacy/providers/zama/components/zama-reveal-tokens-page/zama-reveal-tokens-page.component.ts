import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PrivateEvent } from '../../../shared-privacy-providers/models/private-event';
import { ToAssetsService } from '@app/features/trade/components/assets-selector/services/to-assets.service';
import { ZamaPrivateAssetsService } from '../../services/zama-private-assets.service';
import { TokensFacadeService } from '@app/core/services/tokens/tokens-facade.service';
import { ZamaRevealFacadeService } from '../../services/zama-reveal-tokens-facade.service';
import { ZamaFacadeService } from '../../services/zama-sdk/zama-facade.service';
import { EvmBlockchainName, TokenAmount } from '@cryptorubic/core';
import { TargetNetworkAddressService } from '@app/features/trade/services/target-network-address-service/target-network-address.service';

@Component({
  selector: 'app-zama-reveal-tokens-page',
  templateUrl: './zama-reveal-tokens-page.component.html',
  styleUrls: ['./zama-reveal-tokens-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    { provide: ToAssetsService, useClass: ZamaPrivateAssetsService },
    { provide: TokensFacadeService, useClass: ZamaRevealFacadeService }
  ]
})
export class ZamaRevealTokensPageComponent {
  constructor(
    private readonly zamaFacadeService: ZamaFacadeService,
    private readonly targetAddressService: TargetNetworkAddressService
  ) {}

  public async reveal({ token, loadingCallback }: PrivateEvent): Promise<void> {
    try {
      await this.zamaFacadeService.unwrap(
        token as TokenAmount<EvmBlockchainName>,
        this.targetAddressService.address
      );
    } finally {
      loadingCallback();
    }
  }
}
