import { ChangeDetectionStrategy, Component, Inject, Input } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { combineLatestWith, map, startWith } from 'rxjs/operators';
import { SwapAndEarnFacadeService } from '@features/swap-and-earn/services/swap-and-earn-facade.service';
import { SwapAndEarnWeb3Service } from '@features/swap-and-earn/services/swap-and-earn-web3.service';
import { AuthService } from '@core/services/auth/auth.service';
import { WalletConnectorService } from '@core/services/wallets/wallet-connector-service/wallet-connector.service';
import { WalletsModalService } from '@core/wallets-modal/services/wallets-modal.service';
import { UserInterface } from '@core/services/auth/models/user.interface';
import { BlockchainName, EvmWeb3Pure } from 'rubic-sdk';
import { newRubicToken } from '@features/swap-and-earn/constants/airdrop/airdrop-token';
import { HeaderStore } from '@core/header/services/header.store';
import { WINDOW } from '@ng-web-apis/common';
import { SwapAndEarnStateService } from '@features/swap-and-earn/services/swap-and-earn-state.service';
import { SwapAndEarnPopupService } from '@features/swap-and-earn/services/swap-and-earn-popup.service';
import { PolymorpheusComponent } from '@tinkoff/ng-polymorpheus';
import { RetrodropStakeModalComponent } from '@features/swap-and-earn/components/retrodrop-stake-modal/retrodrop-stake-modal.component';
import { TuiDialogService } from '@taiga-ui/core';
import { SenTab } from '@features/swap-and-earn/models/swap-to-earn-tabs';
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

  public readonly currentTab$ = this.swapAndEarnStateService.currentTab$;

  public readonly isAirdropAddressValid =
    this.swapAndEarnStateService.airdropUserClaimInfo.is_participant;

  public readonly isRetrodropAddressValid$ =
    this.swapAndEarnStateService.isUserParticipantOfRetrodrop$;

  public readonly buttonStateNameMap: Record<ButtonLabel, string> = {
    login: 'airdrop.button.login',
    claim: 'airdrop.button.claim',
    stake: 'airdrop.button.stake',
    claimed: 'airdrop.button.claimed',
    staked: 'airdrop.button.staked',
    wrongAddressError: 'airdrop.button.wrongAddressError',
    emptyError: 'airdrop.button.emptyError',
    changeNetwork: 'airdrop.button.changeNetwork',
    incorrectAddressError: 'airdrop.button.incorrectAddressError',
    notParticipant: 'airdrop.button.notParticipant',
    closed: 'airdrop.button.closed'
  };

  public isMobile = false;

  public buttonState$: Observable<ButtonState> = this.swapAndEarnStateService.currentTab$.pipe(
    combineLatestWith(
      this.swapAndEarnStateService.isUserParticipantOfRetrodrop$,
      this.authService.currentUser$,
      this.walletConnectorService.networkChange$
    ),
    map(([currentTab, isRetrodropAddressValid, user, network]) => {
      const isValid =
        currentTab === 'airdrop'
          ? this.swapAndEarnStateService.airdropUserClaimInfo.is_participant
          : isRetrodropAddressValid;

      const buttonLabel = this.getButtonKey([currentTab, isValid, user, network]);

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

  public readonly loading$ = this.swapAndEarnFacadeService.claimLoading$;

  constructor(
    private readonly swapAndEarnFacadeService: SwapAndEarnFacadeService,
    private readonly swapAndEarnStateService: SwapAndEarnStateService,
    private readonly popupService: SwapAndEarnPopupService,
    private readonly web3Service: SwapAndEarnWeb3Service,
    private readonly authService: AuthService,
    private readonly walletConnectorService: WalletConnectorService,
    private readonly walletModalService: WalletsModalService,
    private readonly headerService: HeaderStore,
    private readonly dialogService: TuiDialogService,
    @Inject(WINDOW) private readonly window: Window
  ) {
    if (this.window.innerWidth <= 900) {
      this.isMobile = true;
    }
    setTimeout(() => {
      console.log(this.round);
      console.log(this.isAlreadyClaimed);
    }, 2000);
  }

  public async handleClick(state: ButtonLabel): Promise<void> {
    switch (state) {
      case 'changeNetwork':
        await this.swapAndEarnFacadeService.changeNetwork();
        break;
      case 'login':
        this.walletModalService.open$();
        break;
      case 'claim':
        await this.swapAndEarnFacadeService.claimTokens();
        break;
      case 'stake':
        this.showStakeConfirmModal(this.round);
        break;
      default:
    }
  }

  private getButtonKey([tab, isValid, user, network]: [
    SenTab,
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
      if (tab === 'airdrop') {
        return 'claimed';
      } else {
        return 'staked';
      }
    }
    if (isValid) {
      if (tab === 'airdrop') {
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
        this.swapAndEarnFacadeService.claimTokens(round, false, true);
      });
  }
}
