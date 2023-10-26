import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-input-output-container',
  templateUrl: './input-output-container.component.html',
  styleUrls: ['./input-output-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InputOutputContainerComponent {
  @Input() public round: 'top' | 'bottom' | 'all' | 'none' = 'all';

  @Input() public marginTop: boolean;
}
