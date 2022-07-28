import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Router } from '@angular/router';

import { RoundStatus } from '../../models/round-status.enum';
@Component({
  selector: 'app-earn',
  templateUrl: './earn-page.component.html',
  styleUrls: ['./earn-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EarnPageComponent {
  public isShowPastStaking: boolean = false;

  public isShowStakeForm: boolean = false;

  public readonly RoundStatus = RoundStatus;

  constructor(private readonly router: Router) {}

  public pastStakingVisibilityToggle(isShow: boolean): void {
    this.isShowPastStaking = isShow;
  }

  public navigateToStakeForm(): void {
    this.router.navigate(['staking-lp', 'new-position']);
  }
}
