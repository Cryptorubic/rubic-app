import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import BigNumber from 'bignumber.js';
import { BigNumberFormatPipe } from '@shared/pipes/big-number-format.pipe';
import { ShortenAmountPipe } from '@shared/pipes/shorten-amount.pipe';
import { Token } from '@shared/models/tokens/token';
import { AppGasData } from '../../models/provider-info';
import { HintAppearance, HintDirection, SwapDataElementConfig } from './model';
import { FeeInfo } from '@app/core/services/sdk/sdk-legacy/features/cross-chain/calculation-manager/providers/common/models/fee-info';

@Component({
  selector: 'app-swap-data-element',
  templateUrl: './swap-data-element.component.html',
  styleUrls: ['./swap-data-element.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SwapDataElementComponent {
  /**
   * used to hide micro fee for 0% fee swaps
   */
  public readonly minAmountToShowProtocolFee = new BigNumber(0.0000005);

  public feeInfo: FeeInfo;

  public displayAmount: string | null;

  @Input() creationConfig: SwapDataElementConfig = {
    feeIcon: 'assets/images/icons/money.svg',
    withVerboseFeeHint: true
  };

  @Input() hintAppearance: HintAppearance = '';

  @Input() hintDirection: HintDirection = 'bottom-right';

  @Input({ required: true }) set feeInfoChange(value: {
    fee: FeeInfo | null;
    nativeToken: Token;
    displayAmount?: string;
  }) {
    this.feeInfo = value.fee;
    if (value.displayAmount) {
      this.displayAmount = value.displayAmount;
    } else {
      const providerPercentFee = value?.fee?.provider?.platformFee;
      const percentFeeAmount = new BigNumber(providerPercentFee?.percent ?? 0).multipliedBy(
        providerPercentFee?.token.tokenAmount ?? 0
      );
      const percentFeeAmountUsd = percentFeeAmount.multipliedBy(
        providerPercentFee?.token.price ?? 0
      );

      const nativeFeeSum = new BigNumber(0)
        .plus(value?.fee?.rubicProxy?.fixedFee?.amount || 0)
        .plus(value?.fee?.provider?.cryptoFee?.amount || 0);

      if (nativeFeeSum.gt(0)) {
        if (value?.nativeToken?.price) {
          const fiatAmountOut = nativeFeeSum
            .multipliedBy(value.nativeToken.price)
            .plus(percentFeeAmountUsd);
          this.displayAmount = fiatAmountOut.gt(0.001) ? `~ $${fiatAmountOut.toFixed(2)}` : null;
        } else if (value.nativeToken?.symbol) {
          const bnPipe = new BigNumberFormatPipe();
          const shortenPipe = new ShortenAmountPipe();
          const uiNativeTokenAmount = shortenPipe.transform(bnPipe.transform(nativeFeeSum), 6, 4);
          this.displayAmount = `${uiNativeTokenAmount} ${value.nativeToken.symbol}`;

          // adds src token fee in ui, if exists
          if (percentFeeAmount.gt(0)) {
            const uiPercentFeeTokenAmount = shortenPipe.transform(
              bnPipe.transform(percentFeeAmount),
              6,
              4
            );
            this.displayAmount += `+ ${uiPercentFeeTokenAmount} ${providerPercentFee?.token.symbol}`;
          }
        }
      } else if (percentFeeAmountUsd.gt(0)) {
        if (value?.nativeToken?.price) {
          const fiatAmountOut = nativeFeeSum
            .multipliedBy(value.nativeToken.price)
            .plus(percentFeeAmountUsd);
          this.displayAmount = fiatAmountOut.gt(0.001) ? `~ $${fiatAmountOut.toFixed(2)}` : null;
        } else {
          const bnPipe = new BigNumberFormatPipe();
          const shortenPipe = new ShortenAmountPipe();
          const uiPercentFeeTokenAmount = shortenPipe.transform(
            bnPipe.transform(percentFeeAmount),
            6,
            4
          );
          this.displayAmount = `${uiPercentFeeTokenAmount} ${providerPercentFee?.token.symbol}`;
        }
      } else {
        this.displayAmount = this.creationConfig.zeroFeeText ?? null;
      }
    }
  }

  @Input() gasInfo: AppGasData | null;

  @Input() averageTimeMins: string | number;

  @Input() time95PercentSwapsMins: string | number;

  @Input() hideHint: boolean = false;

  public toPercent(amount: number): string {
    return new BigNumber(amount).multipliedBy(100).toFixed();
  }
}
