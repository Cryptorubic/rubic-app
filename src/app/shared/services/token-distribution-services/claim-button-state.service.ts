import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuthService } from '@core/services/auth/auth.service';
import { BlockchainName, EvmWeb3Pure } from 'rubic-sdk';
import { newRubicToken } from '@features/airdrop/constants/airdrop-token';
import { ButtonLabel, ButtonState } from '@shared/models/claim/claim-button';
import { WalletConnectorService } from '@core/services/wallets/wallet-connector-service/wallet-connector.service';
import { ClaimName } from '@shared/services/token-distribution-services/models/claim-name';

@Injectable({
  providedIn: 'root'
})
export class ClaimButtonStateService {
  private readonly _buttonState$ = new BehaviorSubject<ButtonState>({
    label: 'login',
    translation: '',
    isError: false
  });

  public readonly buttonState$ = this._buttonState$.asObservable();

  constructor(
    private readonly authService: AuthService,
    private readonly walletConnectorService: WalletConnectorService
  ) {}

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

  public setButtonState(
    isValid: boolean,
    userAddress: string,
    isParticipantOfPrevRounds: boolean,
    isClosed: boolean,
    isAlreadyClaimed: boolean,
    claimName: ClaimName
  ): void {
    this.walletConnectorService.networkChange$
      .pipe(
        tap(network => {
          const buttonLabel = this.getButtonKey([
            isValid,
            userAddress,
            network,
            isParticipantOfPrevRounds,
            isClosed,
            isAlreadyClaimed,
            claimName
          ]);

          const buttonState = {
            label: buttonLabel,
            translation: this.buttonStateNameMap[buttonLabel],
            isError: this.getErrorState(buttonLabel)
          };

          this._buttonState$.next(buttonState);
        })
      )
      .subscribe();
  }

  private getErrorState(buttonLabel: ButtonLabel): boolean {
    return buttonLabel === 'wrongAddressError' || buttonLabel === 'incorrectAddressError';
  }

  private getButtonKey([
    isValid,
    userAddress,
    network,
    isParticipantOfPrevRounds,
    isClosed,
    isAlreadyClaimed,
    claimName
  ]: [boolean, string, BlockchainName, boolean, boolean, boolean, ClaimName]): ButtonLabel {
    if (isClosed) {
      return 'closed';
    }
    if (!userAddress) {
      return 'login';
    }
    if (!network || network !== newRubicToken.blockchain) {
      return 'changeNetwork';
    }
    if (!isParticipantOfPrevRounds) {
      return 'notParticipant';
    }
    if (isAlreadyClaimed) {
      if (claimName === 'airdrop') {
        return 'claimed';
      } else {
        return 'staked';
      }
    }
    if (isValid) {
      if (claimName === 'airdrop') {
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
}
