import { ClaimRound } from '@shared/models/claim/claim-round';
import { DefaultRoundInfo } from '@shared/services/claim-services/constants/default-round-info';
import { ClaimName } from '@shared/services/claim-services/models/claim-name';

const DefaultRetrodropRoundInfo = {
  ...DefaultRoundInfo,
  isParticipantOfPrevRounds: false,
  claimName: 'retrodrop' as ClaimName
};

export const retrodropRounds: ClaimRound[] = [
  {
    roundNumber: 1,
    claimDate: '24.08.2023 - 24.02.2024',
    status: 'active',
    ...DefaultRetrodropRoundInfo
  },
  {
    roundNumber: 2,
    claimDate: '26.09.2023 - 26.03.2024',
    status: 'active',
    ...DefaultRetrodropRoundInfo
  },
  {
    roundNumber: 3,
    claimDate: '24.10.2023 - 24.04.2024',
    status: 'active',
    ...DefaultRetrodropRoundInfo
  },
  {
    roundNumber: 4,
    claimDate: '24.11.2023 - 24.05.2024',
    status: 'soon',
    ...DefaultRetrodropRoundInfo
  },
  {
    roundNumber: 5,
    claimDate: '24.12.2023 - 24.06.2024',
    status: 'soon',
    ...DefaultRetrodropRoundInfo
  },
  {
    roundNumber: 6,
    claimDate: '24.01.2024 - 24.07.2024',
    status: 'soon',
    ...DefaultRetrodropRoundInfo
  },
  {
    roundNumber: 7,
    claimDate: '24.02.2024 - 24.08.2024',
    status: 'soon',
    ...DefaultRetrodropRoundInfo
  },
  {
    roundNumber: 8,
    claimDate: '24.03.2024 - 24.09.2024',
    status: 'soon',
    ...DefaultRetrodropRoundInfo
  },
  {
    roundNumber: 9,
    claimDate: '24.04.2024 - 24.10.2024',
    status: 'soon',
    ...DefaultRetrodropRoundInfo
  },
  {
    roundNumber: 10,
    claimDate: '24.05.2024 - 24.11.2024',
    status: 'soon',
    ...DefaultRetrodropRoundInfo
  },
  {
    roundNumber: 11,
    claimDate: '24.06.2024 - 24.12.2024',
    status: 'soon',
    ...DefaultRetrodropRoundInfo
  },
  {
    roundNumber: 12,
    claimDate: '24.07.2024 - 24.01.2025',
    status: 'soon',
    ...DefaultRetrodropRoundInfo
  }
];
