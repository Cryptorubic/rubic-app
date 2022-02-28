import { ChangeDetectionStrategy, Component } from '@angular/core';
import { StakingService } from '../../services/staking.service';

@Component({
  selector: 'app-staking-page',
  templateUrl: './staking-page.component.html',
  styleUrls: ['./staking-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StakingPageComponent {
  public round = this.stakingService.stakingRound;

  constructor(private readonly stakingService: StakingService) {}

  public handleRoundChange(index: number): void {
    this.round = index;
  }
}
