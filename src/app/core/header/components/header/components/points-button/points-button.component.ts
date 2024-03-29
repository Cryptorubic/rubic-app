import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ROUTE_PATH } from '@shared/constants/common/links';
import { Router } from '@angular/router';
import { map } from 'rxjs/operators';
import { AirdropPointsService } from '@shared/services/airdrop-points-service/airdrop-points.service';
import { AuthService } from '@core/services/auth/auth.service';

@Component({
  selector: 'app-points-button',
  templateUrl: './points-button.component.html',
  styleUrls: ['./points-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PointsButtonComponent {
  public readonly points$ = this.airdropPointsService.points$.pipe(
    map(points => {
      return points.pending + points.confirmed;
    })
  );

  public readonly isAuth$ = this.authService.currentUser$;

  constructor(
    private readonly router: Router,
    private readonly airdropPointsService: AirdropPointsService,
    private readonly authService: AuthService
  ) {}

  public async navigateToSwapAndEarn(): Promise<void> {
    await this.router.navigate([ROUTE_PATH.AIRDROP], { queryParamsHandling: '' });
  }
}
