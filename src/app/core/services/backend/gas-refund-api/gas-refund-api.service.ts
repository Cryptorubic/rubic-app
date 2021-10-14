import { Injectable } from '@angular/core';
import { Observable, timer } from 'rxjs';
import { Promotion } from 'src/app/features/my-trades/models/promotion';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { HttpService } from 'src/app/core/services/http/http.service';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class GasRefundApiService {
  private static baseUrl = 'promotion';

  constructor(private httpService: HttpService, private authService: AuthService) {}

  public getUserPromotions(): Observable<Promotion[]> {
    /* return this.httpService.get<Promotion[]>(GasRefundApiService.baseUrl, {
      walletAddress: this.authService.userAddress
    }); */

    return timer(0).pipe(
      map(() => [
        {
          id: '123',
          transactions: ['0x1234', '0x12345'],
          totalRefundUSD: 12.345,
          refundDate: new Date(1634054988964)
        },
        {
          id: '124',
          transactions: ['0x12346'],
          totalRefundUSD: 0.345,
          refundDate: new Date(Date.now() + 100000)
        },
        {
          id: '125',
          transactions: ['0x1234', '0x12345'],
          totalRefundUSD: 12.345,
          refundDate: new Date(Date.now() + 100000)
        },
        {
          id: '126',
          transactions: ['0x12346'],
          totalRefundUSD: 0.345,
          refundDate: new Date(Date.now() + 100000)
        }
      ])
    );
  }
}
