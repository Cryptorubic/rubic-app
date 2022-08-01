import { RoundContract } from '../models/round-contract.interface';
import { NFT_CONTRACT_ABI } from './NFT_CONTRACT_ABI';
import { REWARDS_CONTRACT_ABI } from './REWARDS_CONTRACT_ABI';

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
    address: '0x67dE69B8b8C0301F8439b041de862752DC596CB1',
    abi: NFT_CONTRACT_ABI
  },
  REWARDS: {
    address: '0x4E474Af6D95b51dd1192b61e72A8Cc8E68d92e8E',
    abi: REWARDS_CONTRACT_ABI
  }
};
