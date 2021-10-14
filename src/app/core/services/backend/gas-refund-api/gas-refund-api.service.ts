import { Injectable } from '@angular/core';
import { Observable, timer } from 'rxjs';
import { Promotion } from 'src/app/features/my-trades/models/promotion';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { HttpService } from 'src/app/core/services/http/http.service';
import { map } from 'rxjs/operators';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';

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
          transactions: [
            {
              hash: '0x627d53b6ba0977bc7b9e008ac73b9463d302d4369e31afa7057551a7de7478e2',
              blockchain: BLOCKCHAIN_NAME.ETHEREUM,
              date: new Date(1634054988964)
            },
            {
              hash: '0xf9a45399485d364d819507c75a34d77a831093c4fac86c6bba8aaf8b0ae4aa2e',
              blockchain: BLOCKCHAIN_NAME.ETHEREUM,
              date: new Date()
            }
          ],
          totalRefundUSD: 12.345,
          refundDate: new Date(1634054988964)
        },
        {
          id: '124',
          transactions: [
            {
              hash: '0xf9a45399485d364d819507c75a34d77a831093c4fac86c6bba8aaf8b0ae4aa2e',
              blockchain: BLOCKCHAIN_NAME.ETHEREUM,
              date: new Date(1634054988964)
            }
          ],
          totalRefundUSD: 0.345,
          refundDate: new Date(Date.now() + 100000)
        },
        {
          id: '123',
          transactions: [
            {
              hash: '0xf9a45399485d364d819507c75a34d77a831093c4fac86c6bba8aaf8b0ae4aa2e',
              blockchain: BLOCKCHAIN_NAME.ETHEREUM,
              date: new Date(1634054988964)
            },
            {
              hash: '0xf9a45399485d364d819507c75a34d77a831093c4fac86c6bba8aaf8b0ae4aa2e',
              blockchain: BLOCKCHAIN_NAME.ETHEREUM,
              date: new Date()
            }
          ],
          totalRefundUSD: 12.345,
          refundDate: new Date(Date.now() + 100000)
        },
        {
          id: '123',
          transactions: [
            {
              hash: '0x1234',
              blockchain: BLOCKCHAIN_NAME.ETHEREUM,
              date: new Date(1634054988964)
            }
          ],
          totalRefundUSD: 0.345,
          refundDate: new Date(Date.now() + 100000)
        }
      ])
    );
  }
}
