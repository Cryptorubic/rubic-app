import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AirdropStateService } from '@features/airdrop/services/airdrop-state.service';
import { AuthService } from '@core/services/auth/auth.service';
import { AirdropFacadeService } from '@features/airdrop/services/airdrop-facade.service';

@Component({
  selector: 'app-airdrop-page',
  templateUrl: './airdrop-page.component.html',
  styleUrls: ['./airdrop-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AirdropPageComponent {
  public readonly workingStatus$ = this.airdropStateService.workingStatus$;

  public readonly points$ = this.airdropStateService.points$;

  public readonly currentUser$ = this.authService.currentUser$;

  public readonly isAirdropAddressValid$ = this.airdropStateService.isUserParticipantOfSwapAndEarn$;

  public readonly isRetrodropAddressValid$ = this.airdropStateService.isUserParticipantOfRetrodrop$;

  public readonly loading$ = this.airdropFacadeService.airdropAndRetrodropFetchLoading$;

  constructor(
    private readonly airdropStateService: AirdropStateService,
    private readonly airdropFacadeService: AirdropFacadeService,
    private readonly authService: AuthService
  ) {}

  public async handleWithdraw(points: number): Promise<void> {
    await this.airdropStateService.claimPoints(points);
  }
}
