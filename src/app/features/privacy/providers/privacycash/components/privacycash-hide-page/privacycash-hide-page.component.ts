import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ChangeDetectionStrategy, Component, OnInit, inject, DestroyRef } from '@angular/core';
import { FormControl } from '@angular/forms';
import { PrivacycashSwapService } from '../../services/privacy-cash-swap.service';
import { FromAssetsService } from '@app/features/trade/components/assets-selector/services/from-assets.service';
import { TokensFacadeService } from '@app/core/services/tokens/tokens-facade.service';
import { PrivacycashPublicTokensFacadeService } from '../../services/common/token-facades/privacycash-public-tokens-facade.service';
import { PrivacycashPublicAssetsService } from '../../services/common/assets-services/privacycash-public-assets.service';
import { PrivateEvent } from '../../../shared-privacy-providers/models/private-event';
import { firstValueFrom, startWith, tap } from 'rxjs';
import { PrivateShieldFormConfig } from '../../../shared-privacy-providers/models/swap-form-types';
import BigNumber from 'bignumber.js';
import {
  BlockchainName,
  PriceToken,
  Token,
  TokenAmount,
  nativeTokensList
} from '@cryptorubic/core';
import { TokenService } from '@app/core/services/sdk/sdk-legacy/token-service/token.service';
import { PrivateActionButtonService } from '../../../shared-privacy-providers/services/private-action-button/private-action-button.service';
import { HideWindowService } from '../../../shared-privacy-providers/services/hide-window-service/hide-window.service';

@Component({
  selector: 'app-privacycash-hide-page',
  templateUrl: './privacycash-hide-page.component.html',
  styleUrls: ['./privacycash-hide-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    { provide: FromAssetsService, useExisting: PrivacycashPublicAssetsService },
    { provide: TokensFacadeService, useClass: PrivacycashPublicTokensFacadeService }
  ],
  standalone: false
})
export class PrivacycashHidePageComponent implements OnInit {
  private readonly privacycashSwapService = inject(PrivacycashSwapService);

  private readonly privateActionButtonService = inject(PrivateActionButtonService);

  private readonly tokenService = inject(TokenService);

  private readonly tokensFacade = inject(TokensFacadeService);

  private readonly hideWindowService = inject(HideWindowService);

  public readonly hideFormCreationConfig: PrivateShieldFormConfig = {
    withActionButton: true,
    withReceiver: false,
    withSrcAmount: true,
    withMaxBtn: true
  };

  public readonly receiverCtrl = new FormControl<string>('');

  constructor() {}

  ngOnInit(): void {
    this.receiverCtrl.valueChanges
      .pipe(
        startWith(this.receiverCtrl.value),
        tap(address => {
          this.privateActionButtonService.setReceiverAddress(address);
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe();
  }

  public async hide({ token, loadingCallback, openPreview }: PrivateEvent): Promise<void> {
    try {
      const nativeToken = nativeTokensList.SOLANA;
      const nativeTokenPrice = await this.tokenService.getTokenPrice(nativeToken);
      const prevBalanceWei = Token.toWei(
        this.hideWindowService.hideAsset.amount,
        this.hideWindowService.hideAsset.decimals
      );
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

      this.updateHideAssetBalance(token, new BigNumber(prevBalanceWei));
    } finally {
      loadingCallback();
    }
  }

  private async updateHideAssetBalance(
    token: TokenAmount<BlockchainName>,
    prevBalanceWei: BigNumber
  ): Promise<void> {
    const balance = await this.tokensFacade.waitForChangeAndGetAndUpdateTokenBalance(
      token,
      prevBalanceWei
    );
    this.hideWindowService.setHideAsset({
      ...this.hideWindowService.hideAsset,
      amount: balance
    });
  }

  readonly destroyRef = inject(DestroyRef);
}
