import {
  Component,
  ChangeDetectionStrategy,
  EventEmitter,
  Input,
  OnInit,
  Output
} from '@angular/core';
import { TuiDirection, TuiSizeXL, TuiSizeXS } from '@taiga-ui/core/types';

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

  @Input() disabled: boolean = false;

  @Input() hintDirection: TuiDirection = 'bottom-left';

  @Output() onClickEmit: EventEmitter<Event> = new EventEmitter();

  constructor() {}

  onClick(event: MouseEvent) {
    this.onClickEmit.emit(event);
  }
}
