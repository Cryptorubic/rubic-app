import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { TuiAppearance } from '@taiga-ui/core';
import { TuiSizeXL, TuiSizeXS } from '@taiga-ui/core/types';

@Component({
  selector: 'app-rubic-button',
  templateUrl: './rubic-button.component.html',
  styleUrls: ['./rubic-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RubicButtonComponent {
  public _border: boolean;

  @Input() buttonText: string;

  @Input() disabled: boolean = false;

  @Input() appearance: TuiAppearance | string = 'primary';

  @Input() size: TuiSizeXS | TuiSizeXL = 'l';

  @Input() iconUrl: string;

  @Input() altText: string;

  @Input() fullWidth: boolean;

  @Input('bordered') set setBorder(border: boolean | '') {
    this._border = border === '' || border;
  }

  @Output() onClickEmit: EventEmitter<MouseEvent> = new EventEmitter();

  constructor() {}

  onClick(event: MouseEvent) {
    this.onClickEmit.emit(event);
  }
}
