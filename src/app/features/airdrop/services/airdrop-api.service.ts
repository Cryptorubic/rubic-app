import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import {
  AirdropUserClaimInfo,
  AirdropUserPointsInfo
} from '@features/airdrop/models/airdrop-user-info';
import { RetrodropUserInfo } from '@features/airdrop/models/retrodrop-user-info';
import { WalletConnectorService } from '@core/services/wallets/wallet-connector-service/wallet-connector.service';
import { HttpService } from '@core/services/http/http.service';
import { Cacheable } from 'ts-cacheable';

@Injectable({ providedIn: 'root' })
export class AirdropApiService {
  constructor(
    private readonly walletConnectorService: WalletConnectorService,
    private readonly httpService: HttpService
  ) {}

  private get address(): string {
    return this.walletConnectorService.address;
  }

  public fetchAirdropUserPointsInfo(): Observable<AirdropUserPointsInfo> {
    if (!this.address) {
      return of({ confirmed: 0, pending: 0 });
    }
    return this.httpService.get<AirdropUserPointsInfo>(`rewards/?address=${this.address}`);
  }

  @Cacheable({
    maxAge: 1_800_000
  })
  public fetchRetrodropUserInfo(): Observable<RetrodropUserInfo> {
    if (!this.address) {
      return of([]);
    }
    try {
      return this.httpService.get<RetrodropUserInfo>(`v2/merkle_proofs/retrodrop`, {
        address: this.address
      });
    } catch (error) {
      return of([]);
    }
  }

  public fetchAirdropUserClaimInfo(): Observable<AirdropUserClaimInfo> {
    if (!this.address) {
      return of({
        round: null,
        is_participant: false,
        address: '',
        index: null,
        amount: '',
        proof: []
      });
    }
    try {
      return this.httpService.get<AirdropUserClaimInfo>(`v2/merkle_proofs/claim`, {
        address: this.address
      });
    } catch (error) {
      return of({
        round: null,
        is_participant: false,
        address: '',
        index: null,
        amount: '',
        proof: []
      });
    }
  }
}
