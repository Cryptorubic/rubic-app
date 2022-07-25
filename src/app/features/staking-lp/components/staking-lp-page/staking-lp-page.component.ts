import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-staking-lp-page',
  templateUrl: './staking-lp-page.component.html',
  styleUrls: ['./staking-lp-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StakingLpPageComponent {
  public isShowPastStaking: boolean = false;

  public isShowStakeForm: boolean = false;

  constructor() {}

  public pastStakingVisibilityToggle(isShow: boolean): void {
    this.isShowPastStaking = isShow;
  }

  public showStakeFrom(isShow: boolean): void {
    this.isShowStakeForm = isShow;
  }
}
