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
    address: '0x3b67942461E2B487701748f63c1d24De7C72591E',
    abi: NFT_CONTRACT_ABI
  },
  REWARDS: {
    address: '0x3d9aBCdf76bc969a860175E13Fe4Fc791E836D08',
    abi: REWARDS_CONTRACT_ABI
  }
};
