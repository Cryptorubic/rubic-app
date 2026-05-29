import { MerkleTreeJson } from '@hinkal/common';

export interface StoredSnapshot {
  approvals: Record<string, { tokenAddress: string; amount: string; inHinkalAddress: string }[]>;
  nullifiers: string[];
  merkleTree: MerkleTreeJson;
  merkleTreeAccessToken: MerkleTreeJson;
  encryptedOutputs: Array<{
    value: string;
    isPositive: boolean;
    isBlocked: boolean;
  }>;
}
