import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { Token } from '@app/shared/models/tokens/token';
import BigNumber from 'bignumber.js';

const DEFAULT_PRESETS = ['10', '50', '100', '500', '1000'];
const FIAT_AMOUNTS = [10, 50, 100, 500, 1000];

@Component({
  selector: 'app-preset-amount-list',
  templateUrl: './preset-amount-list.component.html',
  styleUrls: ['./preset-amount-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PresetAmountListComponent {
  public presets: string[] = [];

  public tokenSymbol: string = '';

  @Input() quantity = 5;

  @Input({ required: true }) selectedAmount: string;

  @Input({ required: true }) set token(value: Token) {
    this.tokenSymbol = value.symbol;
    const presets: string[] = [];

    if (value.price && value.type !== 'STABLE') {
      for (const fiatAmount of FIAT_AMOUNTS) {
        if (presets.length === this.quantity) break;

        const tokenAmount = new BigNumber(fiatAmount).dividedBy(value.price);

        if (tokenAmount.isLessThan(1)) {
          presets.push(tokenAmount.toFixed(2, BigNumber.ROUND_UP));
        } else {
          presets.push(tokenAmount.toFixed(0, BigNumber.ROUND_HALF_UP));
        }
      }

      this.presets = presets;
    } else {
      this.presets = DEFAULT_PRESETS.slice(0, this.quantity);
    }
  }

  @Output() onPresetSelect = new EventEmitter<string>();
}
