import { ChangeDetectionStrategy, Component, signal } from '@angular/core';

@Component({
  selector: 'app-rewards-view',
  templateUrl: './rewards-view.component.html',
  styleUrl: './rewards-view.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RewardsViewComponent {
  protected readonly title = signal('Rewards');
}
