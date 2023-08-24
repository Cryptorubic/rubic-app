import { Injectable } from '@angular/core';
import { SwapAndEarnMerkleService } from '@features/swap-and-earn/services/swap-and-earn-merkle.service';
import { HttpClient } from '@angular/common/http';
import { Cacheable } from 'ts-cacheable';
import { Observable } from 'rxjs';
import { MerkleTree } from '@features/swap-and-earn/models/merkle-tree';

@Injectable()
export class RetrodropMerkleService extends SwapAndEarnMerkleService {
  constructor(private readonly httpClient: HttpClient) {
    super();
  }

  @Cacheable({
    maxAge: 3_600_000
  })
  protected fetchMerkleTree(): Observable<MerkleTree> {
    return this.httpClient.get<MerkleTree>(`/assets/content/retrodrop-merkle-tree.json`);
  }
}
