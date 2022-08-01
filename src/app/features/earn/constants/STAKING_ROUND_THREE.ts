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
    address: '0xC457Cb68DedCFCb2201f9455707E4Fd833B2E3D4',
    abi: NFT_CONTRACT_ABI
  },
  REWARDS: {
    address: '0xA3052f4701a24e0FBe109A92Cf3fc44B32dD4A3F',
    abi: REWARDS_CONTRACT_ABI
  }
};
