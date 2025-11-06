import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import BigNumber from 'bignumber.js';
import { BigNumberFormatPipe } from '@shared/pipes/big-number-format.pipe';
import { ShortenAmountPipe } from '@shared/pipes/shorten-amount.pipe';
import { Token } from '@shared/models/tokens/token';
import { AppGasData } from '../../models/provider-info';
import { HintAppearance, HintDirection } from './model';
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

  @Input() hintAppearance: HintAppearance = '';

  @Input() hintDirection: HintDirection = 'bottom-right';

  @Input({ required: true }) set feeInfoChange(value: { fee: FeeInfo | null; nativeToken: Token }) {
    this.feeInfo = value.fee;
    const sum = new BigNumber(0)
      .plus(value?.fee?.rubicProxy?.fixedFee?.amount || 0)
      .plus(value?.fee?.provider?.cryptoFee?.amount || 0);

    if (value?.nativeToken?.price && sum.gt(0)) {
      const fiatAmountOut = sum.multipliedBy(value.nativeToken.price);
      this.displayAmount = fiatAmountOut.gt(0.001) ? `~ $${fiatAmountOut.toFixed(2)}` : null;
    } else if (value.nativeToken?.symbol && sum.gt(0)) {
      const bnPipe = new BigNumberFormatPipe();
      const shortenPipe = new ShortenAmountPipe();

      this.displayAmount = `${shortenPipe.transform(bnPipe.transform(sum), 6, 4)} ${
        value.nativeToken.symbol
      }`;
    } else {
      this.displayAmount = null;
    }
  }

  @Input({ required: true }) gasInfo: AppGasData | null;

  @Input({ required: true }) time: string | number;

  @Input() hideHint: boolean = false;
}
