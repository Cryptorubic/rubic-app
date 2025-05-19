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
import { map } from 'rxjs/operators';
import { Web3Pure } from 'rubic-sdk';

@Injectable()
export class TestnetPromoApiService {
  private readonly url = `${ENVIRONMENT.apiTokenUrl}/v2/promo_campaigns/testnet_mainnet_promotion`;

  constructor(private readonly httpService: HttpService) {}

  public fetchPrizePool(): Observable<PrizePool> {
    try {
      return this.httpService.get(`/prize_pool`, {}, this.url);
    } catch {
      return of({
        left: 0,
        total: 0
      });
    }
  }

  public getUserVerification(address: string): Observable<VerificationStatus> {
    try {
      return this.httpService.get(`/user_verification?address=${address}`, {}, this.url);
    } catch {
      return of({
        address: '',
        isVerified: false
      });
    }
  }

  public fetchUserStats(address: string): Observable<UserStats> {
    try {
      return this.httpService.get(`/user_stats?address=${address}`, {}, this.url);
    } catch {
      return of({
        currentWeek: {
          week: 0,
          earned: 0,
          max: 0,
          mainnetSwaps: 0,
          testnetSwaps: 0
        },
        completedWeeks: []
      });
    }
  }

  public fetchProofs(address: string): Observable<UserProofs> {
    try {
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
        }))
      );
    } catch {
      return of({
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
      });
    }
  }
}
