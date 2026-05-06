import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ChangeDetectionStrategy, Component, inject, DestroyRef } from '@angular/core';
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
import { firstValueFrom, startWith, tap } from 'rxjs';
import { FromAssetsService } from '@app/features/trade/components/assets-selector/services/from-assets.service';
import { PrivateSwapFormConfig } from '../../../shared-privacy-providers/models/swap-form-types';
import { PrivateActionButtonService } from '../../../shared-privacy-providers/services/private-action-button/private-action-button.service';
import { PrivacycashPrivateSwapTokensFacadeService } from '../../services/common/token-facades/privacycash-private-swap-tokens-facade.service';
import { compareTokens } from '@app/shared/utils/utils';
import { PrivacycashTokensService } from '../../services/common/token-facades/privacycash-tokens.service';
import { PrivateSwapWindowService } from '../../../shared-privacy-providers/services/private-swap-window/private-swap-window.service';

@Component({
  selector: 'app-privacycash-swap-page',
  templateUrl: './privacycash-swap-page.component.html',
  styleUrls: ['./privacycash-swap-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    { provide: ToAssetsService, useClass: PrivacycashPrivateAssetsService },
    { provide: FromAssetsService, useClass: PrivacycashPrivateAssetsService },
    { provide: TokensFacadeService, useClass: PrivacycashPrivateSwapTokensFacadeService }
  ],
  standalone: false
})
export class PrivacycashSwapPageComponent {
  private readonly privacycashSwapService = inject(PrivacycashSwapService);

  private readonly privateActionButtonService = inject(PrivateActionButtonService);

  private readonly privacycashTokensService = inject(PrivacycashTokensService);

  private readonly privateSwapWindowService = inject(PrivateSwapWindowService);

  private readonly notificationsService = inject(NotificationsService);

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

    this.subscribeOnPrivateBalanceChanges();
  }

  private subscribeOnPrivateBalanceChanges(): void {
    this.privacycashTokensService.tokens$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(pcTokens => {
        const swapInfo = this.privateSwapWindowService.swapInfo;
        const foundSrcToken = pcTokens.find(pcToken => compareTokens(swapInfo.fromAsset, pcToken));
        const foundDstToken = pcTokens.find(pcToken => compareTokens(swapInfo.toAsset, pcToken));

        if (swapInfo.fromAsset && foundSrcToken) {
          const balance = Token.fromWei(foundSrcToken.balanceWei, swapInfo.fromAsset.decimals);
          this.privateSwapWindowService.patchSwapInfo({
            fromAsset: { ...swapInfo.fromAsset, amount: balance }
          });
        }
        if (swapInfo.toAsset && foundDstToken) {
          const balance = Token.fromWei(foundDstToken.balanceWei, swapInfo.toAsset.decimals);
          this.privateSwapWindowService.patchSwapInfo({
            toAsset: { ...swapInfo.toAsset, amount: balance }
          });
        }
      });
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

  readonly destroyRef = inject(DestroyRef);
}
