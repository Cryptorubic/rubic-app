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

  @Input() altText: string;

  @Input() iconUrl: string;

  @Input() disabled = false;

  @Input() appearance: TuiAppearance | string = 'primary';

  @Input() hintDirection: TuiDirection = 'bottom-left';

  @Output() onClickEmit: EventEmitter<MouseEvent> = new EventEmitter();

  constructor() {}

  onClick(event: MouseEvent) {
    this.onClickEmit.emit(event);
  }
}
