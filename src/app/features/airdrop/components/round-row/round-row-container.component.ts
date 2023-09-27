import { ChangeDetectionStrategy, Component, Inject, Input } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { combineLatestWith, map, startWith } from 'rxjs/operators';
import { AirdropFacadeService } from '@features/airdrop/services/airdrop-facade.service';
import { AuthService } from '@core/services/auth/auth.service';
import { WalletConnectorService } from '@core/services/wallets/wallet-connector-service/wallet-connector.service';
import { WalletsModalService } from '@core/wallets-modal/services/wallets-modal.service';
import { UserInterface } from '@core/services/auth/models/user.interface';
import { BlockchainName, EvmWeb3Pure } from 'rubic-sdk';
import { newRubicToken } from '@features/airdrop/constants/airdrop/airdrop-token';
import { WINDOW } from '@ng-web-apis/common';
import { AirdropStateService } from '@features/airdrop/services/airdrop-state.service';
import { PolymorpheusComponent } from '@tinkoff/ng-polymorpheus';
import { RetrodropStakeModalComponent } from '@features/retrodrop/components/retrodrop-stake-modal/retrodrop-stake-modal.component';
import { TuiDialogService } from '@taiga-ui/core';
import BigNumber from 'bignumber.js';

type ButtonLabel =
  | 'login'
  | 'emptyError'
  | 'wrongAddressError'
  | 'changeNetwork'
  | 'claim'
  | 'stake'
  | 'claimed'
  | 'staked'
  | 'incorrectAddressError'
  | 'notParticipant'
  | 'closed';

interface ButtonState {
  label: ButtonLabel;
  translation: string;
  isError: boolean;
}

@Component({
  selector: 'app-round-row-container',
  templateUrl: './round-row-container.component.html',
  styleUrls: ['./round-row-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RoundRowContainerComponent {
  @Input() public readonly claimData: string = '';

  @Input() public readonly round: number = 1;

  @Input() public readonly disabled: boolean = false;

  @Input() public readonly isAlreadyClaimed: boolean;

  @Input() public readonly isClosed: boolean;

  @Input() public readonly isNotParticipant: boolean = false;

  @Input() public readonly claimAmount: BigNumber = new BigNumber(0);

  public readonly isAirdropAddressValid =
    this.airdropStateService.airdropUserClaimInfo.is_participant;

  public readonly isRetrodropAddressValid$ = this.airdropStateService.isUserParticipantOfRetrodrop$;

  public readonly buttonStateNameMap: Record<ButtonLabel, string> = {
    login: 'airdrop.button.login',
    claim: 'airdrop.button.claim',
    claimed: 'airdrop.button.claimed',
    stake: 'airdrop.button.stake',
    staked: 'airdrop.button.staked',
    closed: 'airdrop.button.closed',
    emptyError: 'airdrop.button.emptyError',
    changeNetwork: 'airdrop.button.changeNetwork',
    notParticipant: 'airdrop.button.notParticipant',
    wrongAddressError: 'airdrop.button.wrongAddressError',
    incorrectAddressError: 'airdrop.button.incorrectAddressError'
  };

  public isMobile = false;

  public buttonState$: Observable<ButtonState> = this.authService.currentUser$.pipe(
    combineLatestWith(
      this.airdropStateService.isUserParticipantOfRetrodrop$,
      this.authService.currentUser$,
      this.walletConnectorService.networkChange$
    ),
    map(([currentUser, isRetrodropAddressValid, user, network]) => {
      const isValid = true;

      console.log(currentUser, isRetrodropAddressValid);

      const buttonLabel = this.getButtonKey([isValid, user, network]);

      return {
        label: buttonLabel,
        translation: this.buttonStateNameMap[buttonLabel],
        isError: this.getErrorState(buttonLabel)
      };
    }),
    startWith({
      label: 'emptyError' as ButtonLabel,
      translation: this.buttonStateNameMap['emptyError'],
      isError: false
    })
  );

  public readonly loading$ = this.airdropFacadeService.claimLoading$;

  constructor(
    private readonly airdropFacadeService: AirdropFacadeService,
    private readonly airdropStateService: AirdropStateService,
    private readonly authService: AuthService,
    private readonly walletConnectorService: WalletConnectorService,
    private readonly walletModalService: WalletsModalService,
    private readonly dialogService: TuiDialogService,
    @Inject(WINDOW) private readonly window: Window
  ) {
    if (this.window.innerWidth <= 900) {
      this.isMobile = true;
    }
  }

  public async handleClick(state: ButtonLabel): Promise<void> {
    switch (state) {
      case 'changeNetwork':
        await this.airdropFacadeService.changeNetwork();
        break;
      case 'login':
        this.walletModalService.open$();
        break;
      case 'claim':
        await this.airdropFacadeService.claimTokens();
        break;
      case 'stake':
        this.showStakeConfirmModal(this.round);
        break;
      default:
    }
  }

  private getButtonKey([isValid, user, network]: [
    boolean,
    UserInterface,
    BlockchainName
  ]): ButtonLabel {
    if (!user?.address) {
      return 'login';
    }
    if (!network || network !== newRubicToken.blockchain) {
      return 'changeNetwork';
    }
    if (this.isNotParticipant) {
      return 'notParticipant';
    }
    if (this.isClosed) {
      return 'closed';
    }
    if (this.isAlreadyClaimed) {
      if ('airdrop' === 'airdrop') {
        return 'claimed';
      } else {
        return 'staked';
      }
    }
    if (isValid) {
      if ('airdrop' === 'airdrop') {
        return 'claim';
      } else {
        return 'stake';
      }
    }

    const address = this.walletConnectorService.address;
    if (!Boolean(address)) {
      return 'emptyError';
    }

    const isEthAddress = EvmWeb3Pure.isAddressCorrect(address);
    return isEthAddress ? 'wrongAddressError' : 'incorrectAddressError';
  }

  private getErrorState(buttonLabel: ButtonLabel): boolean {
    return buttonLabel === 'wrongAddressError' || buttonLabel === 'incorrectAddressError';
  }

  public showStakeConfirmModal(round: number): Subscription {
    return this.dialogService
      .open(new PolymorpheusComponent(RetrodropStakeModalComponent), {
        size: 's'
      })
      .subscribe(() => {
        this.airdropFacadeService.claimTokens(round, false, true);
      });
  }
}
