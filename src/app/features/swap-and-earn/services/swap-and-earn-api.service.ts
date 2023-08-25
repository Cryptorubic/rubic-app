import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { MerkleTree } from '@features/swap-and-earn/models/merkle-tree';
import { HttpClient } from '@angular/common/http';

Injectable();
export class SwapAndEarnApiService {
  constructor(private readonly httpClient: HttpClient) {}

  public fetchRetrodropTree(): Observable<MerkleTree> {
    return this.httpClient.get<MerkleTree>(`/assets/content/retrodrop-merkle-tree.json`);
  }

  public fetchAirdropTree(): Observable<MerkleTree> {
    return this.httpClient.get<MerkleTree>(`/assets/content/airdrop-merkle-tree.json`);
  }
}
