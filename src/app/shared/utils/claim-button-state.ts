import { ButtonLabel, ButtonState } from '@shared/models/claim/claim-button';
import { BlockchainName, EvmWeb3Pure } from '@cryptorubic/sdk';
import { ClaimStatus } from '@shared/models/claim/claim-round';
import { ClaimName } from '@shared/services/claim-services/models/claim-name';
import { newRubicToken } from '@features/airdrop/constants/airdrop-token';

const buttonStateNameMap: Record<ButtonLabel, string> = {
  login: 'airdrop.button.login',
  claim: 'airdrop.button.claim',
  claimed: 'airdrop.button.claimed',
  stake: 'airdrop.button.stake',
  staked: 'airdrop.button.staked',
  closed: 'airdrop.button.closed',
  soon: 'airdrop.button.soon',
  expired: 'airdrop.button.expired',
  emptyError: 'airdrop.button.emptyError',
  changeNetwork: 'airdrop.button.changeNetwork',
  notParticipant: 'airdrop.button.notParticipant',
  wrongAddressError: 'airdrop.button.wrongAddressError',
  incorrectAddressError: 'airdrop.button.incorrectAddressError'
};

const getErrorState = (buttonLabel: ButtonLabel): boolean => {
  return buttonLabel === 'wrongAddressError' || buttonLabel === 'incorrectAddressError';
};

const getButtonKey = ([
  isParticipantOfCurrentRound,
  userAddress,
  network,
  status,
  isAlreadyClaimed,
  claimName
]: [boolean, string, BlockchainName, ClaimStatus, boolean, ClaimName]): ButtonLabel => {
  if (!userAddress) {
    return 'login';
  }
  if (status !== 'active') {
    return 'expired';
  }
  if (!isParticipantOfCurrentRound) {
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
  if (isParticipantOfCurrentRound) {
    if (claimName === 'airdrop') {
      return 'claim';
    } else {
      return 'stake';
    }
  }

  const isEthAddress = EvmWeb3Pure.isAddressCorrect(userAddress);
  return isEthAddress ? 'wrongAddressError' : 'incorrectAddressError';
};

export const setButtonState = (
  isParticipantOfCurrentRound: boolean,
  userAddress: string,
  network: BlockchainName,
  status: ClaimStatus,
  isAlreadyClaimed: boolean,
  claimName: ClaimName
): ButtonState => {
  const buttonLabel = getButtonKey([
    isParticipantOfCurrentRound,
    userAddress,
    network,
    status,
    isAlreadyClaimed,
    claimName
  ]);

  return {
    label: buttonLabel,
    translation: buttonStateNameMap[buttonLabel],
    isError: getErrorState(buttonLabel)
  };
};
