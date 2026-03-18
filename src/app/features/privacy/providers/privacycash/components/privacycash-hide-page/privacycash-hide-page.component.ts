import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormControl } from '@angular/forms';
import { PrivacycashSwapService } from '../../services/privacy-cash-swap.service';
import { FromAssetsService } from '@app/features/trade/components/assets-selector/services/from-assets.service';
import { TokensFacadeService } from '@app/core/services/tokens/tokens-facade.service';
import { PrivacycashPublicTokensFacadeService } from '../../services/common/token-facades/privacycash-public-tokens-facade.service';
import { PrivacycashPublicAssetsService } from '../../services/common/assets-services/privacycash-public-assets.service';
import { PrivateEvent } from '../../../shared-privacy-providers/models/private-event';
import { firstValueFrom, map, startWith } from 'rxjs';
import { PrivacycashPrivateTokensFacadeService } from '../../services/common/token-facades/privacycash-private-tokens-facade.service';
import { SwapFormInput } from '@app/features/trade/models/swap-form-controls';
import { PrivateShieldFormConfig } from '../../../shared-privacy-providers/models/swap-form-types';
import BigNumber from 'bignumber.js';
import { PriceToken } from '@cryptorubic/core';
import { TokenService } from '@app/core/services/sdk/sdk-legacy/token-service/token.service';

@Component({
  selector: 'app-privacycash-hide-page',
  templateUrl: './privacycash-hide-page.component.html',
  styleUrls: ['./privacycash-hide-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    { provide: FromAssetsService, useClass: PrivacycashPublicAssetsService },
    { provide: TokensFacadeService, useClass: PrivacycashPublicTokensFacadeService }
  ]
})
export class PrivacycashHidePageComponent {
  private readonly privacycashSwapService = inject(PrivacycashSwapService);

  private readonly privateTokensFacade = inject(PrivacycashPrivateTokensFacadeService);

  private readonly tokenService = inject(TokenService);

  public readonly hideFormCreationConfig: PrivateShieldFormConfig = {
    withActionButton: true,
    withReceiver: false,
    withSrcAmount: true
  };

  public readonly shieldedTokens$ = this.privateTokensFacade
    .getTokensList('allChains', '', 'from', {} as SwapFormInput)
    .pipe(
      map(tokens => tokens.filter(t => t.amount.gt(0))),
      startWith([])
    );

  public readonly receiverCtrl = new FormControl<string>('');

  constructor() {}

  public async hide({ token, loadingCallback, openPreview }: PrivateEvent): Promise<void> {
    try {
      const tokenPrice = await this.tokenService.getTokenPrice(token);
      const preview$ = openPreview({
        steps: [
          {
            label: 'Hide Tokens',
            action: () => this.privacycashSwapService.shield(token)
          }
        ],
        feeInfo: {
          provider: {
            cryptoFee: {
              amount: new BigNumber(0),
              token: new PriceToken({ ...token.asStruct, price: tokenPrice })
            }
          }
        },
        dstTokenAmount: token.tokenAmount.toFixed()
      });
      await firstValueFrom(preview$);
    } finally {
      loadingCallback();
    }
  }
}
