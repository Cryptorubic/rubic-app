import { ChangeDetectionStrategy, Component, OnInit, Self, inject } from '@angular/core';
import { FormControl } from '@angular/forms';
import { PrivacycashSwapService } from '../../services/privacy-cash-swap.service';
import { FromAssetsService } from '@app/features/trade/components/assets-selector/services/from-assets.service';
import { TokensFacadeService } from '@app/core/services/tokens/tokens-facade.service';
import { PrivacycashPublicTokensFacadeService } from '../../services/common/token-facades/privacycash-public-tokens-facade.service';
import { PrivacycashPublicAssetsService } from '../../services/common/assets-services/privacycash-public-assets.service';
import { PrivateEvent } from '../../../shared-privacy-providers/models/private-event';
import { firstValueFrom, startWith, takeUntil, tap } from 'rxjs';
import { PrivateShieldFormConfig } from '../../../shared-privacy-providers/models/swap-form-types';
import BigNumber from 'bignumber.js';
import { PriceToken, nativeTokensList } from '@cryptorubic/core';
import { TokenService } from '@app/core/services/sdk/sdk-legacy/token-service/token.service';
import { PrivateActionButtonService } from '../../../shared-privacy-providers/services/private-action-button/private-action-button.service';
import { TuiDestroyService } from '@taiga-ui/cdk';

@Component({
  selector: 'app-privacycash-hide-page',
  templateUrl: './privacycash-hide-page.component.html',
  styleUrls: ['./privacycash-hide-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    TuiDestroyService,
    { provide: FromAssetsService, useExisting: PrivacycashPublicAssetsService },
    { provide: TokensFacadeService, useClass: PrivacycashPublicTokensFacadeService }
  ]
})
export class PrivacycashHidePageComponent implements OnInit {
  private readonly privacycashSwapService = inject(PrivacycashSwapService);

  private readonly privateActionButtonService = inject(PrivateActionButtonService);

  private readonly tokenService = inject(TokenService);

  public readonly hideFormCreationConfig: PrivateShieldFormConfig = {
    withActionButton: true,
    withReceiver: false,
    withSrcAmount: true,
    withMaxBtn: true
  };

  // public readonly shieldedTokens$ = this.privateTokensFacade
  //   .getTokensList('allChains', '', 'from', {} as SwapFormInput)
  //   .pipe(
  //     map(tokens => tokens.filter(t => t.amount.gt(0))),
  //     startWith([])
  //   );

  public readonly receiverCtrl = new FormControl<string>('');

  constructor(@Self() private readonly destroy$: TuiDestroyService) {}

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
      const nativeToken = nativeTokensList.SOLANA;
      const nativeTokenPrice = await this.tokenService.getTokenPrice(nativeToken);
      const preview$ = openPreview({
        steps: [
          {
            label: 'Shield',
            action: () => this.privacycashSwapService.shield(token)
          }
        ],
        feeInfo: {
          provider: {
            cryptoFee: {
              amount: new BigNumber(0.002),
              token: new PriceToken({ ...nativeToken.asStruct, price: nativeTokenPrice })
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
