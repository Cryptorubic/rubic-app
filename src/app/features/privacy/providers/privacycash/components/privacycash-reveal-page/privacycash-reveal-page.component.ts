import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ChangeDetectionStrategy, Component, Self, inject, DestroyRef } from '@angular/core';
import { FormControl } from '@angular/forms';
import { TokensFacadeService } from '@app/core/services/tokens/tokens-facade.service';
import { PrivacycashPrivateAssetsService } from '../../services/common/assets-services/privacycash-private-assets.service';
import { PrivacycashSwapService } from '../../services/privacy-cash-swap.service';
import { PrivateEvent } from '../../../shared-privacy-providers/models/private-event';
import { WalletConnectorService } from '@app/core/services/wallets/wallet-connector-service/wallet-connector.service';
import { filter, firstValueFrom, map, startWith, takeUntil, tap } from 'rxjs';
import { PriceTokenAmount, Token, TokenAmount } from '@cryptorubic/core';
import { toPrivacyCashTokenAddr } from '../../utils/converter';
import { TokenService } from '@app/core/services/sdk/sdk-legacy/token-service/token.service';
import { PrivateActionButtonService } from '../../../shared-privacy-providers/services/private-action-button/private-action-button.service';
import { PrivateShieldFormConfig } from '../../../shared-privacy-providers/models/swap-form-types';
import { getCorrectAddressValidator } from '@app/features/trade/components/target-network-address/utils/get-correct-address-validator';
import { RevealWindowService } from '../../../shared-privacy-providers/services/reveal-window/reveal-window.service';
import { PrivacycashPrivateUnshieldTokensFacadeService } from '../../services/common/token-facades/privacycash-private-unshield-tokens-facade.service';
import { FromAssetsService } from '@app/features/trade/components/assets-selector/services/from-assets.service';
import { PrivacycashTokensService } from '../../services/common/token-facades/privacycash-tokens.service';
import { compareTokens } from '@app/shared/utils/utils';

@Component({
  selector: 'app-privacycash-reveal-page',
  templateUrl: './privacycash-reveal-page.component.html',
  styleUrls: ['./privacycash-reveal-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    { provide: FromAssetsService, useClass: PrivacycashPrivateAssetsService },
    { provide: TokensFacadeService, useClass: PrivacycashPrivateUnshieldTokensFacadeService }
  ]
})
export class PrivacycashRevealPageComponent {
  private readonly privacycashSwapService = inject(PrivacycashSwapService);

  private readonly privateActionButtonService = inject(PrivateActionButtonService);

  private readonly walletConnectorService = inject(WalletConnectorService);

  private readonly revealWindowService = inject(RevealWindowService);

  private readonly tokenService = inject(TokenService);

  private readonly privacycashTokensService = inject(PrivacycashTokensService);

  public readonly receiverCtrl = new FormControl<string>('');

  public readonly revealFormCreationConfig: PrivateShieldFormConfig = {
    withActionButton: true,
    withReceiver: true,
    withSrcAmount: true,
    withMaxBtn: true,
    receiverPlaceholder: 'Enter SOLANA receiver address',
    direction: 'from'
  };

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

    this.revealWindowService.revealAsset$
      .pipe(filter(Boolean), takeUntilDestroyed(this.destroyRef))
      .subscribe(token => {
        this.receiverCtrl.clearAsyncValidators();
        this.receiverCtrl.setAsyncValidators(
          getCorrectAddressValidator({
            fromAssetType: token.blockchain,
            validatedChain: token.blockchain
          })
        );
        this.receiverCtrl.updateValueAndValidity({ emitEvent: false });
      });

    this.subscribeOnPrivateBalanceChanges();
  }

  private subscribeOnPrivateBalanceChanges(): void {
    this.privacycashTokensService.tokens$
      .pipe(
        filter(() => !!this.revealWindowService.revealAsset?.address),
        map(pcTokens =>
          pcTokens.find(pcToken => compareTokens(pcToken, this.revealWindowService.revealAsset))
        ),
        filter(Boolean),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(pcToken => {
        const revealAsset = this.revealWindowService.revealAsset;
        const balance = Token.fromWei(pcToken.balanceWei, revealAsset.decimals);
        this.revealWindowService.setRevealAsset({ ...revealAsset, amount: balance });
      });
  }

  public async reveal({ token, loadingCallback, openPreview }: PrivateEvent): Promise<void> {
    try {
      const pcSupportedToken = new TokenAmount({
        ...token.asStructWithAmount,
        address: toPrivacyCashTokenAddr(token.address)
      });
      const [dstToken, tokenPrice] = await Promise.all([
        this.privacycashSwapService.quote(pcSupportedToken, pcSupportedToken, token.tokenAmount),
        this.tokenService.getTokenPrice(token)
      ]);

      const pcFeeNonWei = token.tokenAmount.minus(dstToken.tokenAmount);
      const pcFeePercent = pcFeeNonWei.dividedBy(token.tokenAmount).dp(4);
      const receiverAddr = this.receiverCtrl.value
        ? this.receiverCtrl.value
        : this.walletConnectorService.address;

      const preview$ = openPreview({
        steps: [
          {
            label: 'Reveal Tokens',
            action: () => this.privacycashSwapService.unshield(token, receiverAddr)
          }
        ],
        feeInfo: {
          provider: {
            platformFee: {
              percent: pcFeePercent.toNumber(),
              token: new PriceTokenAmount({ ...token.asStructWithAmount, price: tokenPrice })
            }
          }
        },
        swapType: 'unshield',
        dstTokenAmount: dstToken.tokenAmount.toFixed()
      });
      await firstValueFrom(preview$);
    } finally {
      loadingCallback();
    }
  }

  readonly destroyRef = inject(DestroyRef);
}
