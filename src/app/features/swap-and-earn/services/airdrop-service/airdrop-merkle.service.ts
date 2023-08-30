import { Injectable } from '@angular/core';
import sourceAirdropMerkle from '@features/swap-and-earn/constants/airdrop/airdrop-merkle-tree.json';
import { SwapAndEarnMerkleService } from '@features/swap-and-earn/services/swap-and-earn-merkle.service';

@Injectable()
export class AirdropMerkleService extends SwapAndEarnMerkleService {
  constructor() {
    super(sourceAirdropMerkle.claims);
  }
}
