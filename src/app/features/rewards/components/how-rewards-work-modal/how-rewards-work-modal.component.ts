import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TuiButton } from '@taiga-ui/core';

@Component({
  selector: 'app-how-rewards-work-modal',
  imports: [TuiButton],
  templateUrl: './how-rewards-work-modal.component.html',
  styleUrl: './how-rewards-work-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HowRewardsWorkModalComponent {}
