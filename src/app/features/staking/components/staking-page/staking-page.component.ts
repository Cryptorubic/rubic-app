import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * Page component for staking.
 */
@Component({
  selector: 'app-staking-page',
  templateUrl: './staking-page.component.html',
  styleUrls: ['./staking-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StakingPageComponent {}
