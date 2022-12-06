import { ChangeDetectionStrategy, Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-form-switcher',
  templateUrl: './form-switcher.component.html',
  styleUrls: ['./form-switcher.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormSwitcherComponent {
  @Output() public readonly switcherClick: EventEmitter<MouseEvent> = new EventEmitter();
}
