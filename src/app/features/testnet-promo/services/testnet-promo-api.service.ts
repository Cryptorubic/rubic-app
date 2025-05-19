import { Injectable } from '@angular/core';
import { HttpService } from '@core/services/http/http.service';
import {
  PrizePool,
  UserProofs,
  UserStats,
  VerificationStatus
} from '@features/testnet-promo/interfaces/api-models';
import { ENVIRONMENT } from '../../../../environments/environment';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { Web3Pure } from 'rubic-sdk';

@Injectable()
export class TestnetPromoApiService {
  private readonly url = `${ENVIRONMENT.apiTokenUrl}/v2/promo_campaigns/testnet_mainnet_promotion`;

  constructor(private readonly httpService: HttpService) {}

  public fetchPrizePool(): Observable<PrizePool> {
    return this.httpService.get<PrizePool>(`/prize_pool`, {}, this.url).pipe(
      catchError(() =>
        of({
          left: 0,
          total: 0
        })
      )
    );
  }

  private activateUser(address: string): void {
    this.httpService.get(`/activate_user?address=${address}`, {}, this.url).subscribe();
  }

  public getUserVerification(address: string): Observable<VerificationStatus> {
    return this.httpService
      .get<[{ roleId: number; access: boolean }]>(
        `/${address}`,
        {},
        'https://api.guild.xyz/v1/guild/access/34457'
      )
      .pipe(
        map(users => {
          const isVerified = users.some(el => el.roleId === 172354 && el.access);
          return { address, isVerified };
        }),
        tap(() => this.activateUser(address))
      );
  }

  public fetchUserStats(address: string): Observable<UserStats> {
    return this.httpService.get<UserStats>(`/user_stats?address=${address}`, {}, this.url).pipe(
      catchError(() =>
        of({
          currentWeek: {
            week: 0,
            earned: 0,
            max: 0,
            mainnetSwaps: 0,
            testnetSwaps: 0
          },
          completedWeeks: []
        })
      )
    );
  }

  public fetchProofs(address: string): Observable<UserProofs> {
    return this.httpService.get<UserProofs>(`/proofs?address=${address}`, {}, this.url).pipe(
      map(el => ({
        activeRound: {
          ...el.activeRound,
          amount: Web3Pure.fromWei(el.activeRound.amount, 18).toFixed()
        },
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
            proof: []
          },
          completed: []
        })
      )
    );
  }
}
