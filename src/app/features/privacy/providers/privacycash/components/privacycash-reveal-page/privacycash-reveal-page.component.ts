import { ChangeDetectionStrategy, Component, Self, inject } from '@angular/core';
import { FormControl } from '@angular/forms';
import { TokensFacadeService } from '@app/core/services/tokens/tokens-facade.service';
import { PrivacycashPrivateAssetsService } from '../../services/common/assets-services/privacycash-private-assets.service';
import { PrivacycashSwapService } from '../../services/privacy-cash-swap.service';
import { PrivateEvent } from '../../../shared-privacy-providers/models/private-event';
import { WalletConnectorService } from '@app/core/services/wallets/wallet-connector-service/wallet-connector.service';
import { filter, firstValueFrom, startWith, takeUntil, tap } from 'rxjs';
import { PriceTokenAmount, TokenAmount } from '@cryptorubic/core';
import { toPrivacyCashTokenAddr } from '../../utils/converter';
import { TokenService } from '@app/core/services/sdk/sdk-legacy/token-service/token.service';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { PrivateActionButtonService } from '../../../shared-privacy-providers/services/private-action-button/private-action-button.service';
import { PrivateShieldFormConfig } from '../../../shared-privacy-providers/models/swap-form-types';
import { getCorrectAddressValidator } from '@app/features/trade/components/target-network-address/utils/get-correct-address-validator';
import { RevealWindowService } from '../../../shared-privacy-providers/services/reveal-window/reveal-window.service';
import { PrivacycashPrivateUnshieldTokensFacadeService } from '../../services/common/token-facades/privacycash-private-unshield-tokens-facade.service';
import { FromAssetsService } from '@app/features/trade/components/assets-selector/services/from-assets.service';

@Component({
  selector: 'app-privacycash-reveal-page',
  templateUrl: './privacycash-reveal-page.component.html',
  styleUrls: ['./privacycash-reveal-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    TuiDestroyService,
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

  public readonly receiverCtrl = new FormControl<string>('');

  public readonly revealFormCreationConfig: PrivateShieldFormConfig = {
    withActionButton: true,
    withReceiver: true,
    withSrcAmount: true,
    withMaxBtn: true,
    receiverPlaceholder: 'Enter SOLANA receiver address',
    direction: 'from'
  };

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

    this.revealWindowService.revealAsset$
      .pipe(filter(Boolean), takeUntil(this.destroy$))
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
}
