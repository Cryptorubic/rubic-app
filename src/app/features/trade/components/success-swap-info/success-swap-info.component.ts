import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { ROUTE_PATH } from '@shared/constants/common/links';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AirdropPointsService } from '@app/shared/services/airdrop-points-service/airdrop-points.service';

@Component({
  selector: 'app-success-swap-info',
  templateUrl: './success-swap-info.component.html',
  styleUrls: ['./success-swap-info.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SuccessSwapInfoComponent {
  @Input({ required: true }) showPoints: boolean;

  public readonly pointsAmount$: Observable<number> = this.airdropPointsService.pointsAmount$;

  constructor(
    private readonly router: Router,
    private readonly airdropPointsService: AirdropPointsService
  ) {}

  public async navigateToSwapAndEarn(): Promise<void> {
    await this.router.navigate([ROUTE_PATH.AIRDROP], { queryParamsHandling: '' });
  }
}
