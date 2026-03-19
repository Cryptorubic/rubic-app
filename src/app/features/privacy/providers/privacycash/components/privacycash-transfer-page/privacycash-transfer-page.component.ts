import { ChangeDetectionStrategy, Component, OnInit, Self, inject } from '@angular/core';
import { FormControl } from '@angular/forms';
import { PrivateEvent } from '../../../shared-privacy-providers/models/private-event';
import { PrivacycashSwapService } from '../../services/privacy-cash-swap.service';
import { firstValueFrom, startWith, takeUntil, tap } from 'rxjs';
import { TokensFacadeService } from '@app/core/services/tokens/tokens-facade.service';
import { ToAssetsService } from '@app/features/trade/components/assets-selector/services/to-assets.service';
import { PrivacycashPrivateAssetsService } from '../../services/common/assets-services/privacycash-private-assets.service';
import { PrivacycashPrivateTokensFacadeService } from '../../services/common/token-facades/privacycash-private-tokens-facade.service';
import { PriceTokenAmount, TokenAmount } from '@cryptorubic/core';
import { toPrivacyCashTokenAddr } from '../../utils/converter';
import { WalletConnectorService } from '@app/core/services/wallets/wallet-connector-service/wallet-connector.service';
import { TokenService } from '@app/core/services/sdk/sdk-legacy/token-service/token.service';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { PrivateActionButtonService } from '../../../shared-privacy-providers/services/private-action-button/private-action-button.service';

@Component({
  selector: 'app-privacycash-transfer-page',
  templateUrl: './privacycash-transfer-page.component.html',
  styleUrls: ['./privacycash-transfer-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    TuiDestroyService,
    { provide: ToAssetsService, useClass: PrivacycashPrivateAssetsService },
    { provide: TokensFacadeService, useClass: PrivacycashPrivateTokensFacadeService }
  ]
})
export class PrivacycashTransferPageComponent implements OnInit {
  private readonly privacycashSwapService = inject(PrivacycashSwapService);

  private readonly walletConnectorService = inject(WalletConnectorService);

  private readonly privateActionButtonService = inject(PrivateActionButtonService);

  private readonly tokenService = inject(TokenService);

  public readonly receiverCtrl = new FormControl<string>('');

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

  constructor(@Self() private readonly destroy$: TuiDestroyService) {}

  public async transfer({ token, loadingCallback, openPreview }: PrivateEvent): Promise<void> {
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
            label: 'Transfer tokens',
            action: () => this.privacycashSwapService.transfer(token, receiverAddr)
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
        dstTokenAmount: dstToken.tokenAmount.toFixed()
      });
      await firstValueFrom(preview$);
    } finally {
      loadingCallback();
    }
  }
}
