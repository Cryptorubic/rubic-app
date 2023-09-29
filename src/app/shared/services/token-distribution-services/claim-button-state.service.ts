import { Injectable } from '@angular/core';
import { BlockchainName, EvmWeb3Pure } from 'rubic-sdk';
import { newRubicToken } from '@features/airdrop/constants/airdrop-token';
import { ButtonLabel, ButtonState } from '@shared/models/claim/claim-button';
import { WalletConnectorService } from '@core/services/wallets/wallet-connector-service/wallet-connector.service';
import { ClaimName } from '@shared/services/token-distribution-services/models/claim-name';
import { ClaimStatus } from '@shared/models/claim/claim-round';

@Injectable({
  providedIn: 'root'
})
export class ClaimButtonStateService {
  constructor(private readonly walletConnectorService: WalletConnectorService) {}

  public readonly buttonStateNameMap: Record<ButtonLabel, string> = {
    login: 'airdrop.button.login',
    claim: 'airdrop.button.claim',
    claimed: 'airdrop.button.claimed',
    stake: 'airdrop.button.stake',
    staked: 'airdrop.button.staked',
    closed: 'airdrop.button.closed',
    soon: 'airdrop.button.soon',
    emptyError: 'airdrop.button.emptyError',
    changeNetwork: 'airdrop.button.changeNetwork',
    notParticipant: 'airdrop.button.notParticipant',
    wrongAddressError: 'airdrop.button.wrongAddressError',
    incorrectAddressError: 'airdrop.button.incorrectAddressError'
  };

  public setButtonState(
    isValid: boolean,
    userAddress: string,
    network: BlockchainName,
    isParticipantOfPrevRounds: boolean,
    status: ClaimStatus,
    isAlreadyClaimed: boolean,
    claimName: ClaimName
  ): ButtonState {
    const buttonLabel = this.getButtonKey([
      isValid,
      userAddress,
      network,
      isParticipantOfPrevRounds,
      status,
      isAlreadyClaimed,
      claimName
    ]);

    return {
      label: buttonLabel,
      translation: this.buttonStateNameMap[buttonLabel],
      isError: this.getErrorState(buttonLabel)
    };
  }

  private getErrorState(buttonLabel: ButtonLabel): boolean {
    return buttonLabel === 'wrongAddressError' || buttonLabel === 'incorrectAddressError';
  }

  private getButtonKey([
    isValid,
    userAddress,
    network,
    isParticipantOfPrevRounds,
    status,
    isAlreadyClaimed,
    claimName
  ]: [boolean, string, BlockchainName, boolean, ClaimStatus, boolean, ClaimName]): ButtonLabel {
    if (!userAddress) {
      return 'login';
    }
    if (status !== 'active') {
      return status;
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
    if (!network || network !== newRubicToken.blockchain) {
      return 'changeNetwork';
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