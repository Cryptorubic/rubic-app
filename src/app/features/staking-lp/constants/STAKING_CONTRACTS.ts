import { STAKING_CONTRACT_ABI_ROUND_ONE } from '@app/core/constants/staking/STAKING_CONTRACT_ABI_ROUND_ONE';
import { STAKING_CONTRACT_ABI_ROUND_TWO } from '@app/core/constants/staking/STAKING_CONTRACT_ABI_ROUND_TWO';
import { ENVIRONMENT } from 'src/environments/environment';
import { RoundContract } from '../models/round-contract.interface';

export const STAKING_CONTRACTS: RoundContract[] = [
  {
    address: ENVIRONMENT.staking.roundOneContractAddress,
    abi: STAKING_CONTRACT_ABI_ROUND_ONE
  },
  {
    address: ENVIRONMENT.staking.roundTwoContractAddress,
    abi: STAKING_CONTRACT_ABI_ROUND_TWO
  }
];
