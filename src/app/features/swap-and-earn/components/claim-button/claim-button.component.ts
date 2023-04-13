import { ChangeDetectionStrategy, Component } from '@angular/core';
import { combineLatestWith, map, startWith } from 'rxjs/operators';
import { AuthService } from '@core/services/auth/auth.service';
import { WalletConnectorService } from '@core/services/wallets/wallet-connector-service/wallet-connector.service';
import { BlockchainName, EvmWeb3Pure } from 'rubic-sdk';
import { Observable } from 'rxjs';
import { WalletsModalService } from '@core/wallets-modal/services/wallets-modal.service';
import { UserInterface } from '@core/services/auth/models/user.interface';
import { newRubicToken } from '@features/swap-and-earn/constants/airdrop/airdrop-token';
import { AirdropFacadeService } from '@features/swap-and-earn/services/airdrop/airdrop-facade.service';

type ButtonLabel =
  | 'login'
  | 'emptyError'
  | 'wrongAddressError'
  | 'changeNetwork'
  | 'claim'
  | 'incorrectAddressError';

interface ButtonState {
  label: ButtonLabel;
  translation: string;
  isError: boolean;
}

@Component({
  selector: 'app-claim-button',
  templateUrl: './claim-button.component.html',
  styleUrls: ['./claim-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClaimButtonComponent {
  public readonly buttonStateNameMap: Record<ButtonLabel, string> = {
    login: 'airdrop.button.login',
    claim: 'airdrop.button.claim',
    wrongAddressError: 'airdrop.button.wrongAddressError',
    emptyError: 'airdrop.button.emptyError',
    changeNetwork: 'airdrop.button.changeNetwork',
    incorrectAddressError: 'airdrop.button.incorrectAddressError'
  };

  public buttonState$: Observable<ButtonState> = this.airdropService.isValid$.pipe(
    combineLatestWith(this.authService.currentUser$, this.walletConnectorService.networkChange$),
    map(([isValid, user, network]) => this.getButtonKey([isValid, user, network])),
    map(buttonLabel => ({
      label: buttonLabel,
      translation: this.buttonStateNameMap[buttonLabel],
      isError: this.getErrorState(buttonLabel)
    })),
    startWith({
      label: 'emptyError' as ButtonLabel,
      translation: this.buttonStateNameMap['emptyError'],
      isError: false
    })
  );

  public readonly loading$ = this.airdropService.claimLoading$;

  constructor(
    private readonly airdropService: AirdropFacadeService,
    private readonly authService: AuthService,
    private readonly walletConnectorService: WalletConnectorService,
    private readonly walletModalService: WalletsModalService
  ) {}

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
