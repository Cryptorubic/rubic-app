import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ROUTE_PATH } from '@shared/constants/common/links';
import { Router } from '@angular/router';
import { SwapAndEarnStateService } from '@features/swap-and-earn/services/swap-and-earn-state.service';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-points-button',
  templateUrl: './points-button.component.html',
  styleUrls: ['./points-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PointsButtonComponent {
  public readonly points$ = this.swapAndEarnStateService.points$.pipe(
    map(points => points.pending + points.confirmed)
  );

  constructor(
    private readonly router: Router,
    private readonly swapAndEarnStateService: SwapAndEarnStateService
  ) {}

  public async navigateToSwapAndEarn(): Promise<void> {
    await this.router.navigateByUrl(ROUTE_PATH.SWAP_AND_EARN);
  }
}
