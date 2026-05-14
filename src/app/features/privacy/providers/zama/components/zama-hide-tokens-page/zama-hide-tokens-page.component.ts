import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ChangeDetectionStrategy, Component, Self, DestroyRef, inject } from '@angular/core';
import { FormControl } from '@angular/forms';
import { PrivateEvent } from '../../../shared-privacy-providers/models/private-event';
import { FromAssetsService } from '@app/features/trade/components/assets-selector/services/from-assets.service';
import { ZamaPrivateAssetsService } from '../../services/zama-private-assets.service';
import { TokensFacadeService } from '@app/core/services/tokens/tokens-facade.service';
import { ZamaHideTokensFacadeService } from '../../services/zama-hide-tokens-facade.service';
import { filter, firstValueFrom, map, takeUntil } from 'rxjs';
import { ZamaFacadeService } from '../../services/zama-sdk/zama-facade.service';
import { EvmBlockchainName, TokenAmount } from '@cryptorubic/core';
import { PrivateShieldFormConfig } from '../../../shared-privacy-providers/models/swap-form-types';
import { HideWindowService } from '../../../shared-privacy-providers/services/hide-window-service/hide-window.service';
import { compareTokens } from '@app/shared/utils/utils';

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

  constructor(
    private readonly zamaFacadeService: ZamaFacadeService,
    private readonly zamaHideTokensFacade: ZamaHideTokensFacadeService,
    private readonly hideWindowService: HideWindowService
  ) {}

  ngOnInit() {
    this.zamaHideTokensFacade.tokens$
      .pipe(
        filter(() => !!this.hideWindowService.hideAsset?.address),
        map(tokens => tokens.find(token => compareTokens(token, this.hideWindowService.hideAsset))),
        filter(Boolean),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(token => {
        this.hideWindowService.setHideAsset({
          ...this.hideWindowService.hideAsset,
          amount: token.amount
        });
      });
  }

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

  readonly destroyRef = inject(DestroyRef);
}
