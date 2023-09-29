import { ClaimRound } from '@shared/models/claim/claim-round';
import { DefaultRoundInfo } from '@shared/services/token-distribution-services/constants/default-round-info';

export const airdropRounds: ClaimRound[] = [
  {
    roundNumber: 1,
    claimDate: '05.04.2023 - 19.04.2023',
    status: 'closed',
    claimName: 'airdrop',
    isParticipantOfPrevRounds: true,
    ...DefaultRoundInfo
  },
  {
    roundNumber: 2,
    claimDate: '05.04.2023 - 02.05.2023',
    status: 'closed',
    claimName: 'airdrop',
    isParticipantOfPrevRounds: true,
    ...DefaultRoundInfo
  },
  {
    roundNumber: 3,
    claimDate: '05.04.2023 - 17.05.2023',
    status: 'closed',
    claimName: 'airdrop',
    isParticipantOfPrevRounds: true,
    ...DefaultRoundInfo
  },
  {
    roundNumber: 4,
    claimDate: '05.04.2023 - 31.05.2023',
    status: 'closed',
    claimName: 'airdrop',
    isParticipantOfPrevRounds: true,
    ...DefaultRoundInfo
  },
  {
    roundNumber: 5,
    claimDate: '05.04.2023 - 09.06.2023',
    status: 'closed',
    claimName: 'airdrop',
    isParticipantOfPrevRounds: true,
    ...DefaultRoundInfo
  },
  {
    roundNumber: 6,
    claimDate: '05.04.2023 - 06.07.2023',
    status: 'closed',
    claimName: 'airdrop',
    isParticipantOfPrevRounds: true,
    ...DefaultRoundInfo
  },
  {
    roundNumber: 7,
    claimDate: '05.04.2023 - 20.07.2023',
    status: 'closed',
    claimName: 'airdrop',
    isParticipantOfPrevRounds: true,
    ...DefaultRoundInfo
  },
  {
    roundNumber: 8,
    claimDate: '05.04.2023 - 03.08.2023',
    status: 'closed',
    claimName: 'airdrop',
    isParticipantOfPrevRounds: true,
    ...DefaultRoundInfo
  },
  {
    roundNumber: 9,
    claimDate: '05.04.2023 - 24.08.2023',
    status: 'closed',
    claimName: 'airdrop',
    isParticipantOfPrevRounds: true,
    ...DefaultRoundInfo
  },
  {
    roundNumber: 10,
    claimDate: '05.04.2023 - 14.09.2023',
    status: 'closed',
    claimName: 'airdrop',
    isParticipantOfPrevRounds: true,
    ...DefaultRoundInfo
  },
  {
    roundNumber: 11,
    claimDate: '05.04.2023 - 28.09.2023',
    status: 'active',
    claimName: 'airdrop',
    isParticipantOfPrevRounds: true,
    ...DefaultRoundInfo
  }
];