import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PrivateEvent } from '../../../shared-privacy-providers/models/private-event';
import { FromAssetsService } from '@app/features/trade/components/assets-selector/services/from-assets.service';
import { ZamaPrivateAssetsService } from '../../services/zama-private-assets.service';
import { TokensFacadeService } from '@app/core/services/tokens/tokens-facade.service';
import { ZamaHideTokensFacadeService } from '../../services/zama-hide-tokens-facade.service';
import { ZamaRevealFacadeService } from '../../services/zama-reveal-tokens-facade.service';
import { SwapsFormService } from '@app/features/trade/services/swaps-form/swaps-form.service';
import { map } from 'rxjs';
import { ZamaFacadeService } from '../../services/zama-sdk/zama-facade.service';
import { EvmBlockchainName, TokenAmount } from '@cryptorubic/core';

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
  public readonly shieldedTokens$ = this.zamaRevealFacade
    .getTokensList('allChains', '', 'from', this.formService.inputValue)
    .pipe(map(tokens => tokens.filter(token => token.amount.gt(0))));

  constructor(
    private readonly zamaRevealFacade: ZamaRevealFacadeService,
    private readonly formService: SwapsFormService,
    private readonly zamaFacadeService: ZamaFacadeService
  ) {}

  public async hide({ token, loadingCallback }: PrivateEvent): Promise<void> {
    try {
      await this.zamaFacadeService.wrap(token as TokenAmount<EvmBlockchainName>);
    } finally {
      loadingCallback();
    }
  }
}
