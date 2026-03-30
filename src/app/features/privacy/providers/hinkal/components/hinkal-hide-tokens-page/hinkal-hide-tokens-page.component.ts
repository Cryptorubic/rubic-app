import { ChangeDetectionStrategy, Component, Self } from '@angular/core';
import { FormControl } from '@angular/forms';
import { PrivateEvent } from '../../../shared-privacy-providers/models/private-event';
import { FromAssetsService } from '@app/features/trade/components/assets-selector/services/from-assets.service';
import { HinkalPrivateAssetsService } from '../../services/hinkal-private-assets.service';
import { firstValueFrom, map, startWith, takeUntil, tap } from 'rxjs';
import { HinkalFacadeService } from '../../services/hinkal-sdk/hinkal-facade.service';

import { EvmBlockchainName, Token, TokenAmount } from '@cryptorubic/core';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { PrivateActionButtonService } from '../../../shared-privacy-providers/services/private-action-button/private-action-button.service';
import { HINKAL_DEFAULT_CREATION_CONFIG } from '../../constants/hinkal-default-creation-config';
import { HideWindowService } from '../../../shared-privacy-providers/services/hide-window-service/hide-window.service';
import { TokensFacadeService } from '@app/core/services/tokens/tokens-facade.service';

@Component({
  selector: 'app-hinkal-hide-tokens-page',
  templateUrl: './hinkal-hide-tokens-page.component.html',
  styleUrls: ['./hinkal-hide-tokens-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    TuiDestroyService,
    {
      provide: FromAssetsService,
      useClass: HinkalPrivateAssetsService
    }
  ]
})
export class HinkalHideTokensPageComponent {
  public readonly receiverCtrl = new FormControl<string>('');

  public readonly creationConfig$ = this.hinkalFacadeService.activeChain$.pipe(
    map(chain => {
      return {
        ...HINKAL_DEFAULT_CREATION_CONFIG,
        assetsSelectorConfig: {
          ...HINKAL_DEFAULT_CREATION_CONFIG.assetsSelectorConfig,
          listType: chain,
          platformLoading$: this.hinkalFacadeService.balanceLoading$
        }
      };
    })
  );

  constructor(
    private readonly hinkalFacadeService: HinkalFacadeService,
    @Self() private readonly destroy$: TuiDestroyService,
    private readonly privateActionButtonService: PrivateActionButtonService,
    private readonly hideWindowService: HideWindowService,
    private readonly tokensFacade: TokensFacadeService
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

  public async hide({ token, loadingCallback, openPreview }: PrivateEvent): Promise<void> {
    try {
      const steps = await this.hinkalFacadeService.prepareDepositSteps(
        token as TokenAmount<EvmBlockchainName>
      );

      const preview$ = openPreview({ steps });
      await firstValueFrom(preview$);

      const balanceWei = await this.tokensFacade.getAndUpdateTokenBalance(token);
      const balance = Token.fromWei(balanceWei, token.decimals);
      this.hideWindowService.setHideAsset({ ...this.hideWindowService.hideAsset, amount: balance });
    } finally {
      loadingCallback();
    }
  }
}
