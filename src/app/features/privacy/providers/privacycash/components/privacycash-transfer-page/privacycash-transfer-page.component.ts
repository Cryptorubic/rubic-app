import { ChangeDetectionStrategy, Component, OnInit, Self, inject } from '@angular/core';
import { FormControl } from '@angular/forms';
import { PrivateEvent } from '../../../shared-privacy-providers/models/private-event';
import { PrivacycashSwapService } from '../../services/privacy-cash-swap.service';
import { filter, firstValueFrom, map, startWith, takeUntil, tap } from 'rxjs';
import { TokensFacadeService } from '@app/core/services/tokens/tokens-facade.service';
import { PrivacycashPrivateAssetsService } from '../../services/common/assets-services/privacycash-private-assets.service';
import { PriceTokenAmount, Token, TokenAmount } from '@cryptorubic/core';
import { toPrivacyCashTokenAddr } from '../../utils/converter';
import { WalletConnectorService } from '@app/core/services/wallets/wallet-connector-service/wallet-connector.service';
import { TokenService } from '@app/core/services/sdk/sdk-legacy/token-service/token.service';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { PrivateActionButtonService } from '../../../shared-privacy-providers/services/private-action-button/private-action-button.service';
import { PrivateTransferFormConfig } from '../../../shared-privacy-providers/models/swap-form-types';
import { PrivateTransferWindowService } from '../../../shared-privacy-providers/services/private-transfer-window/private-transfer-window.service';
import { getCorrectAddressValidator } from '@app/features/trade/components/target-network-address/utils/get-correct-address-validator';
import { PrivacycashPrivateTransferTokensFacadeService } from '../../services/common/token-facades/privacycash-private-transfer-tokens-facade.service';
import { FromAssetsService } from '@app/features/trade/components/assets-selector/services/from-assets.service';
import { compareTokens } from '@app/shared/utils/utils';
import { PrivacycashTokensService } from '../../services/common/token-facades/privacycash-tokens.service';

@Component({
  selector: 'app-privacycash-transfer-page',
  templateUrl: './privacycash-transfer-page.component.html',
  styleUrls: ['./privacycash-transfer-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    TuiDestroyService,
    { provide: FromAssetsService, useClass: PrivacycashPrivateAssetsService },
    { provide: TokensFacadeService, useClass: PrivacycashPrivateTransferTokensFacadeService }
  ]
})
export class PrivacycashTransferPageComponent implements OnInit {
  private readonly privacycashSwapService = inject(PrivacycashSwapService);

  private readonly walletConnectorService = inject(WalletConnectorService);

  private readonly privateActionButtonService = inject(PrivateActionButtonService);

  private readonly privateTransferWindowService = inject(PrivateTransferWindowService);

  private readonly privacycashTokensService = inject(PrivacycashTokensService);

  private readonly tokenService = inject(TokenService);

  public readonly receiverCtrl = new FormControl<string>('');

  public readonly transferFormCreationConfig: PrivateTransferFormConfig = {
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

    this.privateTransferWindowService.transferAsset$
      .pipe(filter(Boolean), takeUntil(this.destroy$))
      .subscribe(token => {
        this.receiverCtrl.clearAsyncValidators();
        this.receiverCtrl.setAsyncValidators(
          getCorrectAddressValidator(
            {
              fromAssetType: token.blockchain,
              validatedChain: token.blockchain
            },
            { requiredReceiver: true }
          )
        );
        this.receiverCtrl.updateValueAndValidity({ emitEvent: false });
      });

    this.subscribeOnPrivateBalanceChanges();
  }

  private subscribeOnPrivateBalanceChanges(): void {
    this.privacycashTokensService.tokens$
      .pipe(
        filter(() => !!this.privateTransferWindowService.transferAsset?.address),
        map(pcTokens =>
          pcTokens.find(pcToken =>
            compareTokens(pcToken, this.privateTransferWindowService.transferAsset)
          )
        ),
        filter(Boolean),
        takeUntil(this.destroy$)
      )
      .subscribe(pcToken => {
        const transferAsset = this.privateTransferWindowService.transferAsset;
        const balance = Token.fromWei(pcToken.balanceWei, transferAsset.decimals);
        this.privateTransferWindowService.setTransferAsset({ ...transferAsset, amount: balance });
      });
  }

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
