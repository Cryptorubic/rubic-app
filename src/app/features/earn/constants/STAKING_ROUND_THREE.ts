import { RoundContract } from '../models/round-contract.interface';
import { NFT_CONTRACT_ABI } from './NFT_CONTRACT_ABI';
import { REWARDS_CONTRACT_ABI } from './REWARDS_CONTRACT_ABI';
import { ENVIRONMENT } from 'src/environments/environment';

export const STAKING_ROUND_THREE: {
  TEST_TOKEN: RoundContract;
  NFT: RoundContract;
  REWARDS: RoundContract;
} = {
  TEST_TOKEN: {
    address: '',
    abi: []
  },
  NFT: {
    address: ENVIRONMENT.staking.nftContractAddress,
    abi: NFT_CONTRACT_ABI
  },
  REWARDS: {
    address: ENVIRONMENT.staking.rewardsContractAddress,
    abi: REWARDS_CONTRACT_ABI
  }
};
