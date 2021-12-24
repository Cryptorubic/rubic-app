import { Injectable } from '@angular/core';
import { HttpService } from 'src/app/core/services/http/http.service';
import { Observable } from 'rxjs';
import { UpdateDepositRequestInterface } from '@features/staking/models/update-deposit-request.interface';
import { BridgeTxRequestInterface } from '@features/staking/models/bridge-tx-request.interface';
import { pluck } from 'rxjs/operators';

@Injectable()
export class StakingApiService {
  stakingApiPath = '//staking.rubic.exchange/api/';

  constructor(private readonly httpService: HttpService) {}

  public getApr(): Observable<number> {
    return this.httpService.get<number>('apr/', {}, this.stakingApiPath).pipe(pluck('value'));
  }

  public getRefillTime(): Observable<string> {
    return this.httpService
      .get<string>('apr/refill-time', {}, this.stakingApiPath)
      .pipe(pluck('value'));
  }

  public getUsersDeposit(walletAddress: string): Observable<number> {
    return this.httpService
      .get<number>('balance/', { walletAddress }, this.stakingApiPath)
      .pipe(pluck('balance'));
  }

  public updateUsersDeposit(request: UpdateDepositRequestInterface): Observable<void> {
    return this.httpService.post<void>('balance/deposit', { ...request }, this.stakingApiPath);
  }

  public updateUsersDepositAfterWithdraw(request: UpdateDepositRequestInterface): Observable<void> {
    return this.httpService.post<void>('balance/withdraw', { ...request }, this.stakingApiPath);
  }

  public sendBridgeTxHash(request: BridgeTxRequestInterface): Observable<void> {
    return this.httpService.post<void>('transfer-crypto/', { ...request }, this.stakingApiPath);
  }

  public getBridgeContractAddress(): Observable<string> {
    return this.httpService
      .get<string>('transfer-crypto/wallet-address', {}, this.stakingApiPath)
      .pipe(pluck('walletAddress'));
  }
}
