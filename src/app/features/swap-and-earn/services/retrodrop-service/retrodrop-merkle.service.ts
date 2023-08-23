import { Injectable } from '@angular/core';
import sourceRetrodropMerkle from '@features/swap-and-earn/constants/retrodrop/retrodrop-merkle-tree.json';
import { SwapAndEarnMerkleService } from '@features/swap-and-earn/services/swap-and-earn-merkle.service';

@Injectable()
export class RetrodropMerkleService extends SwapAndEarnMerkleService {
  constructor() {
    super(sourceRetrodropMerkle.claims);
  }
}
