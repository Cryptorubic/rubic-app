import {
  Component,
  ChangeDetectionStrategy,
  EventEmitter,
  Input,
  OnInit,
  Output
} from '@angular/core';
import { TuiSizeXL, TuiSizeXS } from '@taiga-ui/core/types';

@Component({
  selector: 'app-rubic-button-circle',
  templateUrl: './rubic-button-circle.component.html',
  styleUrls: ['./rubic-button-circle.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RubicButtonCircleComponent implements OnInit {
  @Input() size: TuiSizeXS | TuiSizeXL;

  @Input() altText: string;

  @Input() iconUrl: string;

  @Input() disabled: boolean = false;

  @Output() onClickEmit: EventEmitter<Event> = new EventEmitter();

  constructor() {}

  ngOnInit(): void {}

  onClick(event: MouseEvent) {
    this.onClickEmit.emit(event);
  }
}
