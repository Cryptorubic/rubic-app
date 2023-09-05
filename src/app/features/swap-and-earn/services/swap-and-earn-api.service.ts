import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import {
  SwapToEarnUserClaimInfo,
  SwapToEarnUserPointsInfo
} from '@features/swap-and-earn/models/swap-to-earn-user-info';
import { RetrodropUserInfo } from '@features/swap-and-earn/models/retrodrop-user-info';
import { WalletConnectorService } from '@core/services/wallets/wallet-connector-service/wallet-connector.service';
import { HttpService } from '@core/services/http/http.service';

@Injectable({ providedIn: 'root' })
export class SwapAndEarnApiService {
  constructor(
    private readonly walletConnectorService: WalletConnectorService,
    private readonly httpService: HttpService
  ) {}

  public fetchSwapToEarnUserPointsInfo(): Observable<SwapToEarnUserPointsInfo> {
    const address = this.walletConnectorService.address;
    if (!address) {
      return of({ confirmed: 0, pending: 0 });
    }
    return this.httpService.get<SwapToEarnUserPointsInfo>(`rewards/?address=${address}`);
  }

  public fetchRetrodropUserInfo(): Observable<RetrodropUserInfo> {
    const address = this.walletConnectorService.address;
    if (!address) {
      return of([]);
    }
    return this.httpService.get<RetrodropUserInfo>(`v2/merkle_proofs/retrodrop`, { address });
  }

  public fetchSwapToEarnUserClaimInfo(): Observable<SwapToEarnUserClaimInfo> {
    const address = this.walletConnectorService.address;
    if (!address) {
      return of({
        round: null,
        is_participant: false,
        address: '',
        index: null,
        amount: '',
        proof: []
      });
    }
    return this.httpService.get<SwapToEarnUserClaimInfo>(`v2/merkle_proofs/claim`, { address });
  }
}
