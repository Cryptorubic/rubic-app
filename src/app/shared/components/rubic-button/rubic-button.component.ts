import { ChangeDetectionStrategy, Component, Input, Output, EventEmitter } from '@angular/core';
import { TuiAppearance } from '@taiga-ui/core';
import { TuiSizeXL, TuiSizeXS } from '@taiga-ui/core/types';

@Component({
  selector: 'app-rubic-button',
  templateUrl: './rubic-button.component.html',
  styleUrls: ['./rubic-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RubicButtonComponent {
  @Input() appearance: TuiAppearance | string = 'primary';

  @Input() size: TuiSizeXS | TuiSizeXL = 'l';

  @Input('bordered') set setBorder(border: boolean | '') {
    this._border = border === '' || border;
  }

  @Input('fullWidth') set fullWidth(fullWidth: boolean | '') {
    this._fullWidth = fullWidth === '' || fullWidth;
  }

  @Input('disabled') set disabled(disabled: boolean | '') {
    this._disabled = disabled === '' || disabled;
  }

  @Input() loading = false;

  @Output() onClick = new EventEmitter<void>();

  public _border: boolean;

  public _fullWidth: boolean;

  public _disabled = false;

  constructor() {}

  public buttonClick(): void {
    if (!this._disabled) {
      this.onClick.emit();
    }
  }
}
