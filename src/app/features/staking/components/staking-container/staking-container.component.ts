import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { QueryParamsService } from '@app/core/services/query-params/query-params.service';

enum StakingNavEnum {
  STAKE = 0,
  WITHDRAW = 1
}

@Component({
  selector: 'app-staking-container',
  templateUrl: './staking-container.component.html',
  styleUrls: ['./staking-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StakingContainerComponent {
  public activeItemIndex = StakingNavEnum.STAKE;

  constructor(
    private readonly router: Router,
    private readonly queryParamsService: QueryParamsService
  ) {}

  public navigateToSwaps(): void {
    this.router.navigate(['/']);
  }
}
