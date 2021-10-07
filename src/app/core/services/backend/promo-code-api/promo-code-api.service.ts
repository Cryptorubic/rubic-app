import { Injectable } from '@angular/core';
import { Observable, timer } from 'rxjs';
import {
  AcceptedPromoCode,
  PromoCode,
  WrongPromoCode
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

  public validatePromoCode(promoCodeText: string): Observable<PromoCode> {
    /* return this.httpService.get(PromoCodeApiService.apiUrl, {
      walletAddress: this.authService.userAddress,
      promoCode: promoCodeText
    }); */

    return timer(2000).pipe(
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
              status: 'wrong',
              text: promoCodeText
            } as WrongPromoCode)
      )
    );
  }
}
