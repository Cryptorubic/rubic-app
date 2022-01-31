import { Injectable } from '@angular/core';
import { HttpService } from '@core/services/http/http.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class IframeApiService {
  constructor(private readonly httpService: HttpService) {}

  public getPromoterAddressByPromoCode(promoCode: string): Observable<string> {
    return this.httpService.get<string>('promo/sdk/promoter', {
      promocode: promoCode
    });
  }
}
