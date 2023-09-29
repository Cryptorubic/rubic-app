import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { RetrodropUserInfo } from '@features/retrodrop/models/retrodrop-user-info';
import { WalletConnectorService } from '@core/services/wallets/wallet-connector-service/wallet-connector.service';
import { HttpService } from '@core/services/http/http.service';

@Injectable()
export class RetrodropApiService {
  constructor(
    private readonly walletConnectorService: WalletConnectorService,
    private readonly httpService: HttpService
  ) {}

  private get address(): string {
    return this.walletConnectorService.address;
  }

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
}
