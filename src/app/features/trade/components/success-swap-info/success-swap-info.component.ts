import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { ROUTE_PATH } from '@shared/constants/common/links';
import { Router } from '@angular/router';

@Component({
  selector: 'app-success-swap-info',
  templateUrl: './success-swap-info.component.html',
  styleUrls: ['./success-swap-info.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SuccessSwapInfoComponent {
  @Input({ required: true }) points: number;

  constructor(private readonly router: Router) {}

  public async navigateToSwapAndEarn(): Promise<void> {
    await this.router.navigate([ROUTE_PATH.AIRDROP], { queryParamsHandling: '' });
  }
}
