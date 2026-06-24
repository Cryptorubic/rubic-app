import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { Token } from '@app/shared/models/tokens/token';
import {
  DEFAULT_PRESETS,
  SOLANA_NATIVE_PRESETS,
  TOKEN_PRESETS_MAPPING
} from './constants/token-presets-mapping';
import { BLOCKCHAIN_NAME } from '@cryptorubic/core';

@Component({
  standalone: false,
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

    const tokenPresets = TOKEN_PRESETS_MAPPING[value.type];

    this.presets = (
      value.blockchain === BLOCKCHAIN_NAME.SOLANA && value.type === 'NATIVE'
        ? SOLANA_NATIVE_PRESETS
        : tokenPresets || DEFAULT_PRESETS
    ).slice(0, this.quantity);
  }

  @Output() onPresetSelect = new EventEmitter<string>();
}
