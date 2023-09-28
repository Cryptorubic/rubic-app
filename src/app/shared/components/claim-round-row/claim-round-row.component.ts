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
import { ClaimButtonStateService } from '@shared/services/token-distribution-services/claim-button-state.service';
import { ClaimRound } from '@shared/models/claim/claim-round';
import BigNumber from 'bignumber.js';

@Component({
  selector: 'app-claim-round-row-container',
  templateUrl: './claim-round-row.component.html',
  styleUrls: ['./claim-round-row.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClaimRoundRowComponent {
  public round: ClaimRound;

  public claimAmount: string | BigNumber;

  public buttonState: ButtonState;

  @Input({ required: true }) set inputRound(claimRound: ClaimRound) {
    this.round = claimRound;

    if (this.round.status === 'soon') {
      this.claimAmount = '-.-';
    } else if (this.round.status === 'closed') {
      this.claimAmount = '0';
    } else {
      this.claimAmount = this.round.claimAmount;
    }

    this.buttonState = this.claimButtonStateService.setButtonState(
      claimRound.isParticipantOfCurrentRound,
      claimRound.claimData.node?.account || '',
      claimRound.network,
      claimRound.isParticipantOfPrevRounds,
      claimRound.status,
      claimRound.isAlreadyClaimed,
      claimRound.claimName
    );
  }

  @Output() public readonly handleClaim = new EventEmitter<{
    claimData: ClaimTokensData;
    claimRound: number;
  }>();

  public isMobile = false;

  public readonly loading$ = this.claimService.claimLoading$;

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
        this.handleClaim.emit({
          claimData: this.round.claimData,
          claimRound: this.round.roundNumber
        });
        break;
      default:
    }
  }
}
