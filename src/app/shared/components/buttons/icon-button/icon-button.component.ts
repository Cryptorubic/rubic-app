import { ChangeDetectionStrategy, Component, Input, Output, EventEmitter } from '@angular/core';
import { TuiSizeXXL, TuiSizeXS } from '@taiga-ui/core/types';
import { BLOCKCHAIN_LABEL } from 'src/app/features/tokens-select/constants/blockchains-labels';

@Component({
  selector: 'app-icon-button',
  templateUrl: './icon-button.component.html',
  styleUrls: ['./icon-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IconButtonComponent {
  public _disabled: boolean;

  public _border: boolean;

  public _blockchainLabel: string;

  @Input() public buttonSize: TuiSizeXS | TuiSizeXXL = 'xxl';

  @Input() icon: string;

  @Input() scale: number = 1;

  @Input('blockchainLabel') set setBlockchainsLabel(blockchainLabel: string) {
    this._blockchainLabel = BLOCKCHAIN_LABEL[blockchainLabel as keyof typeof BLOCKCHAIN_LABEL];
  }

  @Input('disabled') set setDisabled(disabled: boolean | '') {
    this._disabled = disabled === '' || disabled;
  }

  @Input('border') set setBorder(border: boolean | '') {
    this._border = border === '' || border;
  }

  @Output()
  iconButtonClick = new EventEmitter<void>();

  public onClick(): void {
    this.iconButtonClick.emit();
  }

  constructor() {}
}
