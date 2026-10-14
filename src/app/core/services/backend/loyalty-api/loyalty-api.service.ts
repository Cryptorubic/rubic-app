import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpService } from '@app/core/services/http/http.service';
import { ClaimHistoryItem } from './models/claim-history-item';
import { LoyaltyEligibility, LoyaltyEligibilityParams } from './models/loyalty-eligibility';
import { SessionCreateRequest, SessionCreateResponse } from './models/loyalty-session';
import { SubscriptionItem } from './models/subscription-item';
import { TradePoints } from './models/trade-points';
import { UserPoints } from './models/user-points';

@Injectable({ providedIn: 'root' })
export class LoyaltyApiService {
  private readonly httpService = inject(HttpService);

  public getSubscriptions(userAddress?: string): Observable<SubscriptionItem[]> {
    return this.httpService.get<SubscriptionItem[]>(
      'v3/internal/loyalty/subscriptions',
      userAddress ? { userAddress } : undefined
    );
  }

  public getUserPoints(userAddress: string): Observable<UserPoints> {
    return this.httpService.get<UserPoints>('v3/internal/loyalty/user_points', {
      userAddress
    });
  }

  public createSessionMessage(
    userAddress: string,
    domain?: string
  ): Observable<{ message: string }> {
    return this.httpService.post<{ message: string }>('v3/internal/loyalty/session/message', {
      userAddress,
      domain
    });
  }

  public openSession(body: SessionCreateRequest): Observable<SessionCreateResponse> {
    return this.httpService.post<SessionCreateResponse>('v3/internal/loyalty/session', body);
  }

  public getClaimsHistory(token: string): Observable<ClaimHistoryItem[]> {
    return this.httpService.get<ClaimHistoryItem[]>(
      'v3/internal/loyalty/claims/history',
      undefined,
      undefined,
      {
        headers: { Authorization: `Bearer ${token}` },
        timeoutMs: 5_000,
        retry: 1
      }
    );
  }

  public getEligibility(params: LoyaltyEligibilityParams): Observable<LoyaltyEligibility> {
    return this.httpService.get<LoyaltyEligibility>('v3/internal/loyalty/eligibility', params);
  }

  public getTradePoints(rubicId: string): Observable<TradePoints> {
    return this.httpService.get<TradePoints>('v3/internal/loyalty/trade_points', { rubicId });
  }
}
