import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { WalletsModalService } from '@core/wallets-modal/services/wallets-modal.service';
import { ButtonLabel, ButtonState } from '@shared/models/claim/claim-button';
import { NumberedClaimTokensData } from '@shared/models/claim/claim-tokens-data';
import { ClaimRound, ClaimStatus } from '@shared/models/claim/claim-round';
import BigNumber from 'bignumber.js';
import { setButtonState } from '@shared/utils/claim-button-state';
import { ClaimService } from '@shared/services/claim-services/claim.services';
import { HeaderStore } from '@core/header/services/header.store';

@Component({
  selector: 'app-claim-round-row-container',
  templateUrl: './claim-round-row.component.html',
  styleUrls: ['./claim-round-row.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClaimRoundRowComponent {
  public round: ClaimRound;

  public claimAmountValue: string | BigNumber;

  public buttonState: ButtonState;

  @Input({ required: true }) isModal: boolean = false;

  @Input({ required: true }) loading: boolean = false;

  @Input({ required: true }) set inputRound(claimRound: ClaimRound) {
    this.round = claimRound;
    this.setButtonStateValue(claimRound);
    this.setClaimAmountValue(this.round.status, this.round.claimAmount);
  }

  @Output() public readonly handleClaim = new EventEmitter<NumberedClaimTokensData>();

  public isMobile$ = this.headerStore.getMobileDisplayStatus();

  constructor(
    private readonly claimService: ClaimService,
    private readonly walletModalService: WalletsModalService,
    private readonly headerStore: HeaderStore
  ) {}

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

  private setButtonStateValue(claimRound: ClaimRound): void {
    this.buttonState = setButtonState(
      claimRound.isParticipantOfCurrentRound,
      claimRound.claimData.node?.account || '',
      claimRound.network,
      claimRound.status,
      claimRound.isAlreadyClaimed,
      claimRound.claimName
    );
  }

  private setClaimAmountValue(status: ClaimStatus, claimAmount: BigNumber): void {
    if (status === 'soon' || status === 'expired') {
      this.claimAmountValue = '-.-';
    } else if (status === 'closed') {
      this.claimAmountValue = '0';
    } else {
      this.claimAmountValue = claimAmount;
    }
  }

  public getHintText(): string | null {
    if (this.round.status === 'closed' && this.round.claimName !== 'airdrop') {
      return null;
    }

    if (this.round.status === 'closed' && this.round.claimName === 'airdrop') {
      return `The Claiming Round has finished;
      all claimed tokens have now been transferred into the next Claiming Round.`;
    }

    if (this.round.status === 'soon') {
      return 'The round will start soon.';
    }

    if (!this.round.isParticipantOfPrevRounds && this.round.claimName !== 'airdrop') {
      return "You're not eligible";
    }

    if (this.round.isAlreadyClaimed) {
      if (this.round.claimName === 'retrodrop') {
        return 'Your tokens have already been successfully staked. Please review the Staking tab for further details.';
      } else {
        return 'Your tokens have been already claimed, please check your wallet.';
      }
    }
  }
}
