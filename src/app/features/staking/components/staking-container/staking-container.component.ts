import { Component, ChangeDetectionStrategy } from '@angular/core';

enum StakingNav {
  'STAKING',
  'UNSTAKING'
}

@Component({
  selector: 'app-staking-container',
  templateUrl: './staking-container.component.html',
  styleUrls: ['./staking-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StakingContainerComponent {
  public activeItemIndex = StakingNav.STAKING;

  constructor() {}
}
