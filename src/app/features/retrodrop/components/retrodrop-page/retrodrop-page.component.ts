import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { RetrodropService } from '@features/retrodrop/services/retrodrop.service';
import { PolymorpheusComponent } from '@tinkoff/ng-polymorpheus';
import { RetrodropStakeModalComponent } from '@features/retrodrop/components/retrodrop-stake-modal/retrodrop-stake-modal.component';
import { TuiDialogService } from '@taiga-ui/core';
import { ClaimRound } from '@shared/models/claim/claim-round';
import { NumberedClaimTokensData } from '@shared/models/claim/claim-tokens-data';

@Component({
  selector: 'app-retrodrop-container',
  templateUrl: './retrodrop-page.component.html',
  styleUrls: ['./retrodrop-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RetrodropPageComponent {
  public readonly rounds$: Observable<ClaimRound[]> = this.retrodropService.rounds$;

  public readonly fetchUserInfoLoading$ = this.retrodropService.fetchUserInfoLoading$;

  public readonly fetchError$ = this.retrodropService.fetchError$;

  public readonly isUserParticipantOfRetrodrop$ =
    this.retrodropService.isUserParticipantOfRetrodrop$;

  public readonly isAuth$ = this.retrodropService.currentUser$;

  public readonly claimLoading$ = this.retrodropService.claimLoading$;

  constructor(
    private readonly retrodropService: RetrodropService,
    private readonly dialogService: TuiDialogService
  ) {}

  public trackByRoundNumber(_index: number, round: ClaimRound): number {
    return round.roundNumber;
  }

  public handleClaim(roundData: NumberedClaimTokensData): void {
    this.showStakeConfirmModal(roundData);
  }

  public showStakeConfirmModal(roundData: NumberedClaimTokensData): Subscription {
    return this.dialogService
      .open(new PolymorpheusComponent(RetrodropStakeModalComponent), {
        size: 's'
      })
      .subscribe(() => {
        this.retrodropService.claimTokens(roundData.claimData, roundData.claimRound, false, true);
      });
  }
}
