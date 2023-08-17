import { ChangeDetectionStrategy, Component, Inject, Input } from '@angular/core';
import { Observable } from 'rxjs';
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

type ButtonLabel =
  | 'login'
  | 'emptyError'
  | 'wrongAddressError'
  | 'changeNetwork'
  | 'claim'
  | 'claimed'
  | 'incorrectAddressError';

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

  @Input() public readonly round: string = '1';

  @Input() public readonly disabled: boolean = false;

  @Input() public readonly isAlreadyClaimed: boolean;

  @Input() public readonly isClosed: boolean;

  public readonly claimAmount$ = this.airdropService.claimedTokens$;

  public readonly buttonStateNameMap: Record<ButtonLabel, string> = {
    login: 'airdrop.button.login',
    claim: 'airdrop.button.claim',
    claimed: 'airdrop.button.claimed',
    wrongAddressError: 'airdrop.button.wrongAddressError',
    emptyError: 'airdrop.button.emptyError',
    changeNetwork: 'airdrop.button.changeNetwork',
    incorrectAddressError: 'airdrop.button.incorrectAddressError'
  };

  public isMobile = false;

  public buttonState$: Observable<ButtonState> = this.airdropService.isValid$.pipe(
    combineLatestWith(
      this.authService.currentUser$,
      this.walletConnectorService.networkChange$,
      this.airdropService.isAlreadyClaimed$
    ),
    map(([isValid, user, network, isAlreadyClaimed]) => {
      const buttonLabel = this.getButtonKey([isValid, user, network, isAlreadyClaimed]);

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

  public readonly loading$ = this.airdropService.claimLoading$;

  constructor(
    private readonly airdropService: SwapAndEarnFacadeService,
    private readonly web3Service: SwapAndEarnWeb3Service,
    private readonly authService: AuthService,
    private readonly walletConnectorService: WalletConnectorService,
    private readonly walletModalService: WalletsModalService,
    private readonly headerService: HeaderStore,
    @Inject(WINDOW) private readonly window: Window
  ) {
    if (this.window.innerWidth <= 900) {
      this.isMobile = true;
    }
  }

  public async handleClaim(): Promise<void> {
    await this.airdropService.claimTokens();
  }

  public async handleClick(state: ButtonLabel): Promise<void> {
    switch (state) {
      case 'changeNetwork':
        await this.airdropService.changeNetwork();
        break;
      case 'login':
        this.walletModalService.open$();
        break;
      case 'claim':
        await this.airdropService.claimTokens();
        break;
      default:
    }
  }

  private getButtonKey([isValid, user, network, isAlreadyClaimed]: [
    boolean,
    UserInterface,
    BlockchainName,
    boolean
  ]): ButtonLabel {
    if (!user?.address) {
      return 'login';
    }
    if (!network || network !== newRubicToken.blockchain) {
      return 'changeNetwork';
    }
    if (isAlreadyClaimed) {
      return 'claimed';
    }
    if (isValid) {
      return 'claim';
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
}
