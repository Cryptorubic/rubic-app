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
import BigNumber from 'bignumber.js';
import { ButtonLabel, ButtonState } from '@shared/models/claim/claim-button';
import { ClaimService } from '@shared/services/token-distribution-services/claim.services';
import { ClaimTokensData } from '@shared/models/claim/claim-tokens-data';
import { Observable } from 'rxjs';
import { ClaimButtonStateService } from '@shared/services/token-distribution-services/claim-button-state.service';

@Component({
  selector: 'app-claim-round-row-container',
  templateUrl: './claim-round-row.component.html',
  styleUrls: ['./claim-round-row.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClaimRoundRowComponent {
  @Input() public readonly round: number = 1;

  @Input() public readonly claimDate: string = '';

  @Input() public readonly claimData: ClaimTokensData;

  @Input() public readonly claimAmount: BigNumber = new BigNumber(0);

  @Input() public readonly isAlreadyClaimed: boolean;

  @Input() public readonly isClosed: boolean;

  @Input() public readonly isParticipantOfPrevRounds: boolean = false;

  @Input() public readonly isParticipantOfCurrentRound: boolean = false;

  @Input() public readonly disabled: boolean = false;

  @Input() public readonly claimName: 'airdrop' | 'retrodrop' = 'airdrop';

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
    this.claimButtonStateService.setButtonState(
      this.isParticipantOfCurrentRound,
      this.claimData.node.account,
      this.isParticipantOfPrevRounds,
      this.isClosed,
      this.isAlreadyClaimed
    );
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
        this.handleClaim.emit(this.claimData);
        break;
      default:
    }
  }
}
