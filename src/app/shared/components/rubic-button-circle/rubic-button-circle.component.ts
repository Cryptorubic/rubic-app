import { Component, ChangeDetectionStrategy, EventEmitter, Input, Output } from '@angular/core';
import { TuiDirection, TuiSizeXL, TuiSizeXS } from '@taiga-ui/core/types';
import { TuiAppearance } from '@taiga-ui/core';

@Component({
  selector: 'app-rubic-button-circle',
  templateUrl: './rubic-button-circle.component.html',
  styleUrls: ['./rubic-button-circle.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RubicButtonCircleComponent {
  @Input() size: TuiSizeXS | TuiSizeXL;

  @Input() _disabled = false;

  @Input() appearance: TuiAppearance | string = 'primary';

  @Input() hint: string;

  @Input() hintDirection: TuiDirection = 'bottom-left';

  @Output() clickEmit: EventEmitter<MouseEvent> = new EventEmitter();

  @Input('disabled') set disabled(disabled: boolean | '') {
    this._disabled = disabled === '' || disabled;
  }

  constructor() {
    this.hint = '';
  }

  onClick(event: MouseEvent): void {
    this.clickEmit.emit(event);
  }
}
