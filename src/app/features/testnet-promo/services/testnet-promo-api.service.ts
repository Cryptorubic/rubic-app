import { Injectable } from '@angular/core';
import { HttpService } from '@core/services/http/http.service';
import {
  PrizePool,
  SwapsInfo,
  UserProofs,
  VerificationStatus
} from '@features/testnet-promo/interfaces/api-models';
import { ENVIRONMENT } from '../../../../environments/environment';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { Web3Pure } from 'rubic-sdk';

@Injectable()
export class TestnetPromoApiService {
  private readonly mainnetUrl = `${ENVIRONMENT.apiTokenUrl}/v2/promo_campaigns/testnet_mainnet_promotion`;

  private readonly testnetUrl = `${ENVIRONMENT.testnetUrl}/v2/promo_campaigns/testnet_mainnet_promotion`;

  private readonly defaultRetryOptions = {
    timeoutMs: 5_000,
    retry: 1,
    external: true
  };

  constructor(private readonly httpService: HttpService) {}

  public fetchPrizePool(): Observable<PrizePool> {
    return this.httpService
      .get<PrizePool>(`/prize_pool`, {}, this.mainnetUrl, this.defaultRetryOptions)
      .pipe(
        catchError(() =>
          of({
            left: 0,
            total: 0
          })
        )
      );
  }

  private activateUser(address: string): void {
    this.httpService
      .get(`/activate_user?address=${address}`, {}, this.mainnetUrl, this.defaultRetryOptions)
      .subscribe();
  }

  public getUserVerification(address: string): Observable<VerificationStatus> {
    const path = 'https://api.guild.xyz/v1/guild/access/34457';
    return this.httpService
      .get<[{ roleId: number; access: boolean }]>(`/${address}`, {}, path, this.defaultRetryOptions)
      .pipe(
        map(users => {
          const isVerified = users.some(el => el.roleId === 172354 && el.access);
          return { address, isVerified };
        }),
        tap(() => this.activateUser(address))
      );
  }

  public fetchMainnetSwaps(address: string): Observable<SwapsInfo> {
    return this.httpService
      .get<SwapsInfo>(
        `/trades_counter?address=${address}`,
        {},
        this.mainnetUrl,
        this.defaultRetryOptions
      )
      .pipe(catchError(() => of({ totalTrades: 0 })));
  }

  public fetchTestnetSwaps(address: string): Observable<SwapsInfo> {
    return this.httpService
      .get<SwapsInfo>(
        `/trades_counter?address=${address}`,
        {},
        this.testnetUrl,
        this.defaultRetryOptions
      )
      .pipe(catchError(() => of({ totalTrades: 0 })));
  }

  public fetchProofs(address: string): Observable<UserProofs> {
    return this.httpService
      .get<UserProofs>(`/proofs?address=${address}`, {}, this.mainnetUrl, this.defaultRetryOptions)
      .pipe(
        map(el => ({
          activeRound: el?.activeRound
            ? {
                ...el.activeRound,
                amount: Web3Pure.fromWei(el.activeRound.amount, 18).toFixed()
              }
            : null,
          completed: el.completed.map(completed => ({
            ...completed,
            amount: Web3Pure.fromWei(completed.amount || 0, 18).toFixed()
          }))
        })),
        catchError(() =>
          of({
            activeRound: {
              week: 0,
              active: false,
              isParticipant: false,
              contractAddress: '',
              address: '',
              index: 0,
              amount: '0',
              proof: [],
              startDatetime: '',
              endDatetime: ''
            },
            completed: []
          })
        )
      );
  }
}
