import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpService } from '@app/core/services/http/http.service';
import { SubscriptionItem, UserPoints } from './models/models';

@Injectable({ providedIn: 'root' })
export class LoyaltyApiService {
  private readonly httpService = inject(HttpService);

  public getSubscriptions(userAddress?: string): Observable<SubscriptionItem[]> {
    return this.httpService.get<SubscriptionItem[]>(
      'v3/public/client/loyalty/subscriptions',
      userAddress ? { userAddress } : undefined
    );
  }

  public getUserPoints(userAddress: string): Observable<UserPoints> {
    return this.httpService.get<UserPoints>('v3/public/client/loyalty/user_points', {
      userAddress
    });
  }
}
