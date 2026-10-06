import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpService } from '@app/core/services/http/http.service';
import { SubscriptionItem } from '@core/services/backend/loyalty-api/models/subscription-item';

@Injectable({ providedIn: 'root' })
export class LoyaltyApiService {
  private readonly httpService = inject(HttpService);

  public getSubscriptions(): Observable<SubscriptionItem[]> {
    return this.httpService.get<SubscriptionItem[]>('v3/public/client/loyalty/subscriptions');
  }
}
