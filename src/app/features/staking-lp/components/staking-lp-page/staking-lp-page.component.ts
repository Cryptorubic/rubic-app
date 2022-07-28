import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-staking-lp-page',
  templateUrl: './staking-lp-page.component.html',
  styleUrls: ['./staking-lp-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StakingLpPageComponent {
  public isShowPastStaking: boolean = false;

  public isShowStakeForm: boolean = false;

  constructor(private readonly router: Router) {}

  public pastStakingVisibilityToggle(isShow: boolean): void {
    this.isShowPastStaking = isShow;
  }

  public navigateToStakeForm(): void {
    this.router.navigate(['staking-lp', 'new-position']);
  }
}
