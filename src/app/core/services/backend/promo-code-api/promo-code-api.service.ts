import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import {
  AcceptedPromoCode,
  PromoCode,
  RejectedPromoCode
} from 'src/app/features/swaps/models/PromoCode';
import { HttpService } from 'src/app/core/services/http/http.service';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PromoCodeApiService {
  private static apiUrl = 'promo';

  constructor(private httpService: HttpService, private authService: AuthService) {}

  /**
   * Validates text promo code
   * @param promoCodeText
   * @returns promo code with status ('accepted' | 'outdated' | 'wrong' | 'rejected') and additional promo code data
   */
  public validatePromoCode(promoCodeText: string): Observable<PromoCode> {
    /* return this.httpService.get(PromoCodeApiService.apiUrl, {
      walletAddress: this.authService.userAddress,
      promoCode: promoCodeText
    }); */

    return of(null).pipe(
      map(() =>
        promoCodeText === 'TESTPROMO'
          ? ({
              status: 'accepted',
              text: promoCodeText,
              usesLeft: 112,
              usesLimit: 200,
              validUntil: new Date('11.01.2021')
            } as AcceptedPromoCode)
          : ({
              status: 'rejected',
              text: promoCodeText,
              code: 4000
            } as RejectedPromoCode)
      )
    );
  }
}
