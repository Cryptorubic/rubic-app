import { Injectable } from '@angular/core';
import { HttpService } from 'src/app/core/services/http/http.service';
import { Observable } from 'rxjs';
import { UpdateDepositRequestInterface } from '@features/staking/models/update-deposit-request.interface';
import { BridgeTxRequestInterface } from '@features/staking/models/bridge-tx-request.interface';
import { pluck } from 'rxjs/operators';
import { ENVIRONMENT } from 'src/environments/environment';

@Injectable()
export class StakingApiService {
  stakingApiPath = ENVIRONMENT.staking.apiUrl;

  constructor(private readonly httpService: HttpService) {}

  /**
   * Get staking APR.
   * @return Observable<number>
   */
  public getApr(): Observable<number> {
    return this.httpService.get<number>('apr/', {}, this.stakingApiPath).pipe(pluck('value'));
  }

  /**
   * Get staking refill time.
   * @return Observable<string>
   */
  public getRefillTime(): Observable<string> {
    return this.httpService
      .get<string>('apr/refill-time', {}, this.stakingApiPath)
      .pipe(pluck('value'));
  }

  /**
   * Get user's deposit.
   * @param walletAddress
   * @return Observable<number>
   */
  public getUsersDeposit(walletAddress: string): Observable<number> {
    return this.httpService
      .get<number>('balance/', { walletAddress }, this.stakingApiPath)
      .pipe(pluck('balance'));
  }

  /**
   * Update user's deposit after staking.
   * @param request
   * @return Observable<void>
   */
  public updateUsersDeposit(request: UpdateDepositRequestInterface): Observable<void> {
    return this.httpService.post<void>('balance/deposit', { ...request }, this.stakingApiPath);
  }

  /**
   * Update user's deposit after withdraw.
   * @param request
   * @return Observable<void>
   */
  public updateUsersDepositAfterWithdraw(request: UpdateDepositRequestInterface): Observable<void> {
    return this.httpService.post<void>('balance/withdraw', { ...request }, this.stakingApiPath);
  }

  /**
   * Send TX hash after entering stake via bridge.
   * @param request
   * @return Observable<void>
   */
  public sendBridgeTxHash(request: BridgeTxRequestInterface): Observable<void> {
    return this.httpService.post<void>('transfer-crypto/', { ...request }, this.stakingApiPath);
  }

  /**
   * Get bridge contract address for entering stake.
   * @return Observable<string>
   */
  public getBridgeContractAddress(): Observable<string> {
    return this.httpService
      .get<string>('transfer-crypto/wallet-address', {}, this.stakingApiPath)
      .pipe(pluck('walletAddress'));
  }
}
