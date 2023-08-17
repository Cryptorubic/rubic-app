import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SwapAndEarnStateService } from '@features/swap-and-earn/services/swap-and-earn-state.service';
import { AuthService } from '@core/services/auth/auth.service';
import { SwapAndEarnFacadeService } from '@features/swap-and-earn/services/swap-and-earn-facade.service';

@Component({
  selector: 'app-swap-and-earn-page',
  templateUrl: './swap-and-earn-page.component.html',
  styleUrls: ['./swap-and-earn-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SwapAndEarnPageComponent {
  public readonly workingStatus$ = this.swapAndEarnStateService.workingStatus$;

  public readonly points$ = this.swapAndEarnStateService.points$;

  public readonly currentUser$ = this.authService.currentUser$;

  public readonly isValid$ = this.airdropFacadeService.isValid$;

  constructor(
    private readonly swapAndEarnStateService: SwapAndEarnStateService,
    private readonly authService: AuthService,
    private readonly airdropFacadeService: SwapAndEarnFacadeService
  ) {}

  public async handleWithdraw(points: number): Promise<void> {
    await this.swapAndEarnStateService.claimPoints(points);
  }
}
