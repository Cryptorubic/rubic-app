import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpService } from '@app/core/services/http/http.service';
import { ClaimHistoryItem } from './models/claim-history-item';
import { LoyaltyEligibility, LoyaltyEligibilityParams } from './models/loyalty-eligibility';
import { SignedLoyaltyRequest } from './models/signed-loyalty-request';
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

  public signMessage(userAddress: string, action: string): Observable<{ message: string }> {
    return this.httpService.post<{ message: string }>('v3/internal/loyalty/sign_message', {
      userAddress,
      action
    });
  }

  public getClaimsHistory(body: SignedLoyaltyRequest): Observable<ClaimHistoryItem[]> {
    return this.httpService.post<ClaimHistoryItem[]>('v3/internal/loyalty/claims/history', body);
  }

  public getEligibility(params: LoyaltyEligibilityParams): Observable<LoyaltyEligibility> {
    return this.httpService.get<LoyaltyEligibility>('v3/internal/loyalty/eligibility', params);
  }

  public getTradePoints(rubicId: string): Observable<TradePoints> {
    return this.httpService.get<TradePoints>('v3/internal/loyalty/trade_points', { rubicId });
  }
}
