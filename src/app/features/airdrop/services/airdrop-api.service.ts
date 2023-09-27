import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import {
  AirdropUserClaimInfo,
  AirdropUserPointsInfo
} from '@features/airdrop/models/airdrop-user-info';
import { WalletConnectorService } from '@core/services/wallets/wallet-connector-service/wallet-connector.service';
import { HttpService } from '@core/services/http/http.service';
import { defaultUserClaimInfo } from '@shared/services/token-distribution-services/constants/default-user-claim-info';

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

  public fetchAirdropUserClaimInfo(): Observable<AirdropUserClaimInfo> {
    if (!this.address) {
      return of(defaultUserClaimInfo);
    }
    try {
      return this.httpService.get<AirdropUserClaimInfo>(`v2/merkle_proofs/claim`, {
        address: this.address
      });
    } catch (error) {
      return of(defaultUserClaimInfo);
    }
  }
}
