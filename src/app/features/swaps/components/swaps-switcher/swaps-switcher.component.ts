import { ChangeDetectionStrategy, Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-swaps-switcher',
  templateUrl: './swaps-switcher.component.html',
  styleUrls: ['./swaps-switcher.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SwapsSwitcherComponent {
  @Output() public readonly switcherClick: EventEmitter<MouseEvent> = new EventEmitter();
}
