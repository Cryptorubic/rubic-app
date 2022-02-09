import { Observable } from 'rxjs';
import { HttpService } from '@core/services/http/http.service';
import { PromotionApiService } from '@core/services/backend/promotion-api/promotion-api.service';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PromotionPromoterAddressApiService {
  constructor(private readonly httpService: HttpService) {}

  /**
   * Fetches promoter wallet address by promo code
   */
  public getPromoterWalletAddress(promocode: string): Observable<string> {
    return this.httpService.get(PromotionApiService.baseUrl + 'promoter', { promocode });
  }
}
