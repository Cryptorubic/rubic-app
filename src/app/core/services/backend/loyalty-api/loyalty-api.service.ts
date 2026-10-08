import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpService } from '@app/core/services/http/http.service';
import { ClaimHistoryItem } from './models/claim-history-item';
import { SubscriptionItem } from './models/subscription-item';
import { UserPoints } from './models/user-points';
import { SignedLoyaltyRequest } from './models/signed-loyalty-request';

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
}
