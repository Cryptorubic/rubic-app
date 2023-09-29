import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AirdropService } from '@features/airdrop/services/airdrop.service';
import { AuthService } from '@core/services/auth/auth.service';

@Component({
  selector: 'app-airdrop-page',
  templateUrl: './airdrop-page.component.html',
  styleUrls: ['./airdrop-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AirdropPageComponent {
  public readonly points$ = this.airdropService.points$;

  public readonly loadingClaim$ = this.airdropService.fetchUserInfoLoading$;

  public readonly fetchError$ = this.airdropService.fetchError$;

  public readonly loadingPoints$ = this.airdropService.fetchUserPointsInfoLoading$;

  public readonly isAuth$ = this.authService.currentUser$;

  public readonly isParticipant$ = this.airdropService.airdropUserInfo$;

  constructor(
    private readonly airdropService: AirdropService,
    private readonly authService: AuthService
  ) {}
}
