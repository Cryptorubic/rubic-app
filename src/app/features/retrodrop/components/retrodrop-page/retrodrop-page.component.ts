import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { RetrodropService } from '@features/retrodrop/services/retrodrop.service';
import { PolymorpheusComponent } from '@tinkoff/ng-polymorpheus';
import { RetrodropStakeModalComponent } from '@features/retrodrop/components/retrodrop-stake-modal/retrodrop-stake-modal.component';
import { TuiDialogService } from '@taiga-ui/core';
import { ClaimService } from '@shared/services/token-distribution-services/claim.services';
import { ClaimRound } from '@shared/models/claim/claim-round';
import { ClaimTokensData } from '@shared/models/claim/claim-tokens-data';
import { AuthService } from '@core/services/auth/auth.service';

@Component({
  selector: 'app-retrodrop-container',
  templateUrl: './retrodrop-page.component.html',
  styleUrls: ['./retrodrop-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RetrodropPageComponent {
  public readonly rounds$: Observable<ClaimRound[]> = this.retrodropService.rounds$;

  public readonly loading$ = this.retrodropService.fetchUserInfoLoading$;

  public readonly fetchError$ = this.retrodropService.fetchError$;

  public readonly isUserParticipantOfRetrodrop$ =
    this.retrodropService.isUserParticipantOfRetrodrop$;

  public readonly isAuth$ = this.authService.currentUser$;

  constructor(
    private readonly authService: AuthService,
    private readonly retrodropService: RetrodropService,
    private readonly dialogService: TuiDialogService,
    private readonly claimService: ClaimService
  ) {}

  public trackByRoundNumber(_index: number, round: ClaimRound): number {
    return round.roundNumber;
  }

  public handleClaim(roundData: { claimData: ClaimTokensData; claimRound: number }): void {
    this.showStakeConfirmModal(roundData);
  }

  public showStakeConfirmModal(roundData: {
    claimData: ClaimTokensData;
    claimRound: number;
  }): Subscription {
    return this.dialogService
      .open(new PolymorpheusComponent(RetrodropStakeModalComponent), {
        size: 's'
      })
      .subscribe(() => {
        this.claimService.claimTokens(
          roundData.claimData,
          () => this.retrodropService.updateRound(roundData.claimRound),
          false,
          true
        );
      });
  }
}
