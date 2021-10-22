import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Promotion } from '@features/my-trades/models/promotion';
import { AuthService } from '@core/services/auth/auth.service';
import { HttpService } from '@core/services/http/http.service';
import { map } from 'rxjs/operators';
import { MerkleData } from '@features/my-trades/models/merkle-data';
import { MerkleResponse } from '@core/services/backend/gas-refund-api/models/merkle-response';
import BigNumber from 'bignumber.js';
import { PromotionResponse } from '@core/services/backend/gas-refund-api/models/promotion-response';
import { FROM_BACKEND_BLOCKCHAINS } from '@shared/constants/blockchain/BACKEND_BLOCKCHAINS';

@Injectable({
  providedIn: 'root'
})
export class GasRefundApiService {
  private static baseUrl = 'promotion';

  constructor(private httpService: HttpService, private authService: AuthService) {}

  /**
   * Fetches actual user promotions list
   */
  public getUserPromotions(): Observable<Promotion[]> {
    return this.httpService
      .get<PromotionResponse>(GasRefundApiService.baseUrl, {
        walletAddress: this.authService.userAddress
      })
      .pipe(
        map(response =>
          response.map(item => ({
            id: item.promoId,
            transactions: item.transactions.map(transaction => ({
              ...transaction,
              blockchain: FROM_BACKEND_BLOCKCHAINS[transaction.blockchain],
              date: new Date(transaction.date * 1000)
            })),
            refundDate: new Date(item.refundDate * 1000),
            totalRefundUSD: item.totalRefundUSD
          }))
        )
      );
  }

  /**
   * Fetches merkle tree leaves list and root index for specific action
   * @param promotionId action id for which data will be loaded
   */
  public getPromotionMerkleData(promotionId: number): Observable<MerkleData> {
    const endpointUrl = `${GasRefundApiService.baseUrl}/${promotionId}/merkle-tree`;
    const walletAddress = this.authService.userAddress;
    return this.httpService.get<MerkleResponse>(endpointUrl, { walletAddress }).pipe(
      map(response => ({
        ...response,
        amount: new BigNumber(response.amount)
      }))
    );
  }

  /**
   * Sends patch request to mark promotion as spent for current user
   * @param promotionId action id to be marked as used
   */
  public markPromotionAsUsed(promotionId: number): Observable<void> {
    const endpointUrl = `${GasRefundApiService.baseUrl}/${promotionId}`;
    const walletAddress = this.authService.userAddress;
    return this.httpService.patch(endpointUrl, null, { walletAddress });
  }
}
