import { AirdropNode } from '@features/airdrop/models/airdrop-node';

export interface ClaimTokensData {
  contractAddress: string;
  node: AirdropNode | null;
  proof: string[];
}
