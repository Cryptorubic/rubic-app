import { Observable } from 'rxjs';
import { HttpService } from '@core/services/http/http.service';
import { Injectable } from '@angular/core';

// @TODO remove
@Injectable({
  providedIn: 'root'
})
export class PromotionPromoterAddressApiService {
  public static readonly baseUrl = 'promo/';

  constructor(private readonly httpService: HttpService) {}

  /**
   * Fetches promoter wallet address by promo code
   */
  public getPromoterWalletAddress(promocode: string): Observable<string> {
    return this.httpService.get(PromotionPromoterAddressApiService.baseUrl + 'promoter', {
      promocode
    });
  }
}
