import { ChangeDetectionStrategy, Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-rubic-switcher',
  templateUrl: './rubic-switcher.component.html',
  styleUrls: ['./rubic-switcher.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RubicSwitcherComponent {
  @Output() onClick: EventEmitter<MouseEvent> = new EventEmitter();
}
