import { ChangeDetectionStrategy, Component, Input, Output, EventEmitter } from '@angular/core';
import { TuiSizeXL, TuiSizeXS } from '@taiga-ui/core';
import { TuiAppearance } from '@taiga-ui/core';

@Component({
  selector: 'app-icon-button',
  templateUrl: './icon-button.component.html',
  styleUrls: ['./icon-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IconButtonComponent {
  @Input() buttonSize: TuiSizeXS | TuiSizeXL = 'l';

  @Input() appearance: string = TuiAppearance.Primary;

  @Input() icon: string;

  @Input() scale: number = 1;

  @Input() label: string;

  @Input('disabled') set setDisabled(disabled: boolean | '') {
    this._disabled = disabled === '' || disabled;
  }

  @Input('border') set setBorder(border: boolean | '') {
    this._border = border === '' || border;
  }

  @Input() borderRadiusPercent = 0;

  @Input() inlineSvg = false;

  @Output() iconButtonClick = new EventEmitter<void>();

  public _disabled = false;

  public _border: boolean;

  constructor() {}

  public onClick(): void {
    this.iconButtonClick.emit();
  }
}
