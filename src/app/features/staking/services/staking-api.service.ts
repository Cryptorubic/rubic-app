import { Injectable } from '@angular/core';
import { HttpService } from 'src/app/core/services/http/http.service';
import { Observable, of } from 'rxjs';
import { UpdateDepositRequestInterface } from '@features/staking/models/update-deposit-request.interface';
import { BridgeTxRequestInterface } from '@features/staking/models/bridge-tx-request.interface';
import { pluck, tap } from 'rxjs/operators';

@Injectable()
export class StakingApiService {
  constructor(private readonly httpService: HttpService) {}

  public getApr(): Observable<number> {
    return this.httpService
      .get<number>('apr/', {}, '//dev-staking.rubic.exchange/api/')
      .pipe(pluck('value'), tap(console.log));
  }

  public getRefillTime(): Observable<string> {
    return of(new Date().toString());
    // return this.httpService.get<string>('', {});
  }

  public getUsersDeposit(walletAddress: string): Observable<number> {
    return this.httpService
      .get<number>('deposit/', { walletAddress }, '//dev-staking.rubic.exchange/api/')
      .pipe(pluck('balance'));
  }

  public updateUsersDeposit(request: UpdateDepositRequestInterface): Observable<void> {
    console.log(request);
    return this.httpService.post<void>(
      'deposit/',
      { ...request },
      '//dev-staking.rubic.exchange/api/'
    );
  }

  public sendBridgeTxHash(request: BridgeTxRequestInterface): Observable<void> {
    return this.httpService.post<void>(
      'transfer-crypto/',
      { ...request },
      '//dev-staking.rubic.exchange/api/'
    );
  }

  public getBridgeContractAddress(): Observable<string> {
    return this.httpService
      .get<string>('transfer-crypto/wallet-address', {}, '//dev-staking.rubic.exchange/api/')
      .pipe(pluck('walletAddress'));
  }
}
