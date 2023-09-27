import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { RetrodropService } from '@features/retrodrop/services/retrodrop.service';
import { PolymorpheusComponent } from '@tinkoff/ng-polymorpheus';
import { RetrodropStakeModalComponent } from '@features/retrodrop/components/retrodrop-stake-modal/retrodrop-stake-modal.component';
import { TuiDialogService } from '@taiga-ui/core';
import { ClaimService } from '@shared/services/token-distribution-services/claim.services';
import { ClaimRound } from '@shared/models/claim/claim-round';
import { ClaimTokensData } from '@shared/models/claim/claim-tokens-data';

@Component({
  selector: 'app-retrodrop-container',
  templateUrl: './retrodrop-page.component.html',
  styleUrls: ['./retrodrop-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RetrodropPageComponent {
  public readonly rounds$: Observable<ClaimRound[]> = this.retrodropService.rounds$;

  constructor(
    private readonly retrodropService: RetrodropService,
    private readonly dialogService: TuiDialogService,
    private readonly claimService: ClaimService
  ) {}

  public handleClaim(claimData: ClaimTokensData): void {
    this.showStakeConfirmModal(claimData);
  }

  public showStakeConfirmModal(claimData: ClaimTokensData): Subscription {
    return this.dialogService
      .open(new PolymorpheusComponent(RetrodropStakeModalComponent), {
        size: 's'
      })
      .subscribe(() => {
        this.claimService.claimTokens(claimData, false, true);
      });
  }
}
