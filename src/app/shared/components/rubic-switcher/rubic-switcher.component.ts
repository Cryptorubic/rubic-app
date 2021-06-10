import { ChangeDetectionStrategy, Component, EventEmitter, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-rubic-switcher',
  templateUrl: './rubic-switcher.component.html',
  styleUrls: ['./rubic-switcher.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RubicSwitcherComponent {
  @Output() onClickEmit: EventEmitter<MouseEvent> = new EventEmitter();

  onClick(event: MouseEvent) {
    this.onClickEmit.emit(event);
  }
}
