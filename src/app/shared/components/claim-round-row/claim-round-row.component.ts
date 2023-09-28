import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Inject,
  Input,
  Output
} from '@angular/core';
import { WalletsModalService } from '@core/wallets-modal/services/wallets-modal.service';
import { WINDOW } from '@ng-web-apis/common';
import { ButtonLabel, ButtonState } from '@shared/models/claim/claim-button';
import { ClaimService } from '@shared/services/token-distribution-services/claim.services';
import { ClaimTokensData } from '@shared/models/claim/claim-tokens-data';
import { Observable } from 'rxjs';
import { ClaimButtonStateService } from '@shared/services/token-distribution-services/claim-button-state.service';
import { ClaimRound } from '@shared/models/claim/claim-round';
import { ClaimName } from '@shared/services/token-distribution-services/models/claim-name';

interface NamedClaimRound extends ClaimRound {
  claimName: ClaimName;
}

@Component({
  selector: 'app-claim-round-row-container',
  templateUrl: './claim-round-row.component.html',
  styleUrls: ['./claim-round-row.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClaimRoundRowComponent {
  public round: NamedClaimRound;

  @Input({ required: true }) set inputRound(claimRound: ClaimRound) {
    this.round = { ...claimRound, claimName: this.claimName };

    this.claimButtonStateService.setButtonState(
      claimRound.isParticipantOfCurrentRound,
      claimRound.claimData.node?.account || '',
      claimRound.isParticipantOfPrevRounds,
      claimRound.isClosed,
      claimRound.isAlreadyClaimed,
      this.claimName
    );
  }

  @Input({ required: true }) public readonly claimName: ClaimName;

  @Output() public readonly handleClaim = new EventEmitter<ClaimTokensData>();

  public isMobile = false;

  public readonly loading$ = this.claimService.claimLoading$;

  public buttonState$: Observable<ButtonState> = this.claimButtonStateService.buttonState$;

  constructor(
    private readonly claimService: ClaimService,
    private readonly walletModalService: WalletsModalService,
    private readonly claimButtonStateService: ClaimButtonStateService,
    @Inject(WINDOW) private readonly window: Window
  ) {
    if (this.window.innerWidth <= 900) {
      this.isMobile = true;
    }
  }

  public async handleClick(state: ButtonLabel): Promise<void> {
    switch (state) {
      case 'changeNetwork':
        await this.claimService.changeNetwork();
        break;
      case 'login':
        this.walletModalService.open$();
        break;
      case 'claim':
      case 'stake':
        this.handleClaim.emit(this.round.claimData);
        break;
      default:
    }
  }
}
