import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { EarnedPointsView } from '../../models/earned-points-view';

@Component({
  standalone: false,
  selector: 'app-success-swap-info',
  templateUrl: './success-swap-info.component.html',
  styleUrls: ['./success-swap-info.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SuccessSwapInfoComponent {
  @Input() title = 'Yahoo!';

  @Input() earnedPoints: EarnedPointsView | null = null;

  constructor() {}
}
