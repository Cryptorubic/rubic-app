import { LP_PROVIDING_CONTRACT_ABI } from '@app/features/liquidity-providing/constants/LP_PROVIDING_CONTRACT_ABI';
import { ENVIRONMENT } from 'src/environments/environment';
import { RoundContract } from '../models/round-contract.interface';

export const LP_CONTRACTS: RoundContract[] = [
  {
    address: ENVIRONMENT.lpProviding.contractAddress,
    abi: LP_PROVIDING_CONTRACT_ABI,
    active: true
  }
];
