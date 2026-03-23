import { ChangeDetectionStrategy, Component, Self, inject } from '@angular/core';
import { FormControl } from '@angular/forms';
import { PrivacycashSwapService } from '../../services/privacy-cash-swap.service';
import { NotificationsService } from '@app/core/services/notifications/notifications.service';
import { PrivacycashQuoteAdapter } from '../../utils/privacycash-quote-adapter';
import { PrivateSwapEvent } from '../../../shared-privacy-providers/models/private-event';
import { toPrivacyCashTokenAddr } from '../../utils/converter';
import { ToAssetsService } from '@app/features/trade/components/assets-selector/services/to-assets.service';
import { TokensFacadeService } from '@app/core/services/tokens/tokens-facade.service';
import { PrivacycashPrivateAssetsService } from '../../services/common/assets-services/privacycash-private-assets.service';
import { PriceTokenAmount, Token } from '@cryptorubic/core';
import BigNumber from 'bignumber.js';
import { firstValueFrom, startWith, takeUntil, tap } from 'rxjs';
import { FromAssetsService } from '@app/features/trade/components/assets-selector/services/from-assets.service';
import { PrivacycashPrivateTokensFacadeService } from '../../services/common/token-facades/privacycash-private-tokens-facade.service';
import { PrivateSwapFormConfig } from '../../../shared-privacy-providers/models/swap-form-types';
import { TokenService } from '@app/core/services/sdk/sdk-legacy/token-service/token.service';
import { PrivateActionButtonService } from '../../../shared-privacy-providers/services/private-action-button/private-action-button.service';
import { TuiDestroyService } from '@taiga-ui/cdk';

@Component({
  selector: 'app-privacycash-swap-page',
  templateUrl: './privacycash-swap-page.component.html',
  styleUrls: ['./privacycash-swap-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    TuiDestroyService,
    { provide: ToAssetsService, useClass: PrivacycashPrivateAssetsService },
    { provide: FromAssetsService, useClass: PrivacycashPrivateAssetsService },
    { provide: TokensFacadeService, useClass: PrivacycashPrivateTokensFacadeService }
  ]
})
export class PrivacycashSwapPageComponent {
  private readonly privacycashSwapService = inject(PrivacycashSwapService);

  private readonly privateActionButtonService = inject(PrivateActionButtonService);

  private readonly notificationsService = inject(NotificationsService);

  private readonly tokenService = inject(TokenService);

  public readonly swapFormCreationConfig: PrivateSwapFormConfig = {
    withActionButton: true,
    withDstSelector: true,
    withDstAmount: true,
    withReceiver: false,
    withSrcAmount: true
  };

  public readonly receiverCtrl = new FormControl<string>('');

  public readonly quoteAdapter = new PrivacycashQuoteAdapter(
    this.privacycashSwapService,
    this.notificationsService
  );

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

  public async swap({ swapInfo, loadingCallback, openPreview }: PrivateSwapEvent): Promise<void> {
    try {
      const pcSupportedSrcToken = {
        ...swapInfo.fromAsset,
        address: toPrivacyCashTokenAddr(swapInfo.fromAsset.address)
      };
      const pcSupportedDstToken = {
        ...swapInfo.toAsset,
        address: toPrivacyCashTokenAddr(swapInfo.toAsset.address)
      };
      const srcAmountWei = Token.toWei(
        swapInfo.fromAmount.actualValue,
        swapInfo.fromAsset.decimals
      );

      // if src chain is not SOLANA - preview-swap data can be broken
      // const nativeToken = nativeTokensList[swapInfo.fromAsset.blockchain];
      // const [withdrawalFee, nativePrice] = await Promise.all([
      //   this.privacycashSwapService.estimateDirectWithdrawFee(
      //     toPrivacyCashTokenAddr(swapInfo.fromAsset.address),
      //     swapInfo.fromAmount.actualValue
      //   ),
      //   this.tokenService.getTokenPrice(nativeToken)
      // ]);
      const withdrawalFee = await this.privacycashSwapService.estimateDirectWithdrawFee(
        toPrivacyCashTokenAddr(swapInfo.fromAsset.address),
        swapInfo.fromAmount.actualValue
      );
      const srcTokenFeePercent = withdrawalFee.dividedBy(swapInfo.fromAmount.actualValue).dp(4);

      const preview$ = openPreview({
        steps: [
          {
            label: 'Swap',
            action: () =>
              this.privacycashSwapService.swapPartialPrivateBalance(
                pcSupportedSrcToken,
                pcSupportedDstToken,
                new BigNumber(srcAmountWei)
              )
          }
        ],
        feeInfo: {
          provider: {
            platformFee: {
              percent: srcTokenFeePercent.toNumber(),
              token: new PriceTokenAmount({
                ...swapInfo.fromAsset,
                tokenAmount: swapInfo.fromAmount.actualValue,
                price: new BigNumber(swapInfo.fromAsset.price)
              })
            }
          }
        }
      });
      await firstValueFrom(preview$);
    } finally {
      loadingCallback();
    }
  }
}
