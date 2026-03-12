import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PrivateEvent } from '../../../shared-privacy-providers/models/private-event';
import { FromAssetsService } from '@app/features/trade/components/assets-selector/services/from-assets.service';
import { HinkalPrivateAssetsService } from '../../services/hinkal-private-assets.service';
import { HinkalRevealFacadeService } from '../../services/hinkal-reveal-facade.service';
import { SwapsFormService } from '@app/features/trade/services/swaps-form/swaps-form.service';
import { firstValueFrom, map, switchMap } from 'rxjs';
import { HinkalFacadeService } from '../../services/hinkal-sdk/hinkal-facade.service';
import { TargetNetworkAddressService } from '@app/features/trade/services/target-network-address-service/target-network-address.service';
import { EvmBlockchainName, TokenAmount } from '@cryptorubic/core';

@Component({
  selector: 'app-hinkal-hide-tokens-page',
  templateUrl: './hinkal-hide-tokens-page.component.html',
  styleUrls: ['./hinkal-hide-tokens-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: FromAssetsService,
      useClass: HinkalPrivateAssetsService
    }
  ]
})
export class HinkalHideTokensPageComponent {
  public readonly shieldedTokens$ = this.hinkalFacadeService.activeChain$.pipe(
    switchMap(chain =>
      this.hinkalRevealFacade
        .getTokensList(chain, '', 'from', this.formService.inputValue)
        .pipe(map(tokens => tokens.filter(token => token.amount.gt(0))))
    )
  );

  constructor(
    private readonly hinkalRevealFacade: HinkalRevealFacadeService,
    private readonly formService: SwapsFormService,
    private readonly hinkalFacadeService: HinkalFacadeService,
    private readonly targetAddressService: TargetNetworkAddressService
  ) {}

  public async hide({ token, loadingCallback, openPreview }: PrivateEvent): Promise<void> {
    try {
      const preview$ = openPreview({
        steps: [
          {
            label: 'Hide Tokens',
            action: () =>
              this.hinkalFacadeService.deposit(
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
