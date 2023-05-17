import { RoundContract } from '../models/round-contract.interface';
import { NFT_CONTRACT_ABI } from './NFT_CONTRACT_ABI';
import { ENVIRONMENT } from 'src/environments/environment';
import { TOKEN_CONTRACT_ABI } from '@features/earn/constants/TOKEN_CONTRACT_ABI';

export const STAKING_ROUND_THREE: {
  TOKEN: RoundContract;
  NFT: RoundContract;
} = {
  TOKEN: {
    address: ENVIRONMENT.staking.rbcToken,
    abi: TOKEN_CONTRACT_ABI
  },
  NFT: {
    address: ENVIRONMENT.staking.nftContractAddress,
    abi: NFT_CONTRACT_ABI
  }
};
