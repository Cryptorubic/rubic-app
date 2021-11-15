import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Promotion } from '@features/my-trades/models/promotion';
import { AuthService } from '@core/services/auth/auth.service';
import { HttpService } from '@core/services/http/http.service';
import { catchError, map, timeout } from 'rxjs/operators';
import { MerkleData } from '@features/my-trades/models/merkle-data';
import { MerkleResponse } from '@core/services/backend/gas-refund-api/models/merkle-response';
import BigNumber from 'bignumber.js';
import { PromotionResponse } from '@core/services/backend/gas-refund-api/models/promotion-response';
import { FROM_BACKEND_BLOCKCHAINS } from '@shared/constants/blockchain/BACKEND_BLOCKCHAINS';
import { RefundTransaction } from '@features/my-trades/models/refund-transaction';
import { RefundTransactionsResponse } from '@core/services/backend/gas-refund-api/models/refund-transactions-response';

@Injectable({
  providedIn: 'root'
})
export class GasRefundApiService {
  private static readonly baseUrl = 'promo';

  constructor(private httpService: HttpService, private authService: AuthService) {}

  /**
   * Fetches actual user promotions list.
   */
  public getUserPromotions(): Observable<Promotion[]> {
    const endpointUrl = `${GasRefundApiService.baseUrl}/promotions`;
    return this.httpService
      .get<PromotionResponse>(endpointUrl, {
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
   * Fetches merkle tree leaves list and root index for specific action.
   * @param promotionId action id for which data will be loaded.
   * @return merkle tree leaves list and root index.
   */
  public getPromotionMerkleData(promotionId: number): Observable<MerkleData> {
    const endpointUrl = `${GasRefundApiService.baseUrl}/promotions/${promotionId}/merkle-tree`;
    const walletAddress = this.authService.userAddress;
    return this.httpService.get<MerkleResponse>(endpointUrl, { walletAddress }).pipe(
      map(response => ({
        ...response,
        amount: new BigNumber(response.amount)
      }))
    );
  }

  /**
   * Sends patch request to mark promotion as spent for current user.
   * @param txHash method execution transaction hash.
   * @param leaf refund merkle tree leaf.
   */
  public markPromotionAsUsed(txHash: string, leaf: string): Observable<void> {
    const endpointUrl = `${GasRefundApiService.baseUrl}/refunds`;
    return this.httpService.post(endpointUrl, { leaf, hash: txHash });
  }

  /**
   * Fetches past user transactions for gas refund.
   * @return stream that emits once past user refund gas transactions, or empty list if error.
   */
  public getGasRefundTransactions(): Observable<RefundTransaction[]> {
    const endpointUrl = `${GasRefundApiService.baseUrl}/refunds`;
    const walletAddress = this.authService.userAddress;
    return this.httpService.get<RefundTransactionsResponse>(endpointUrl, { walletAddress }).pipe(
      timeout(3000),
      map(response =>
        response.map(item => ({
          ...item,
          network: FROM_BACKEND_BLOCKCHAINS[item.network],
          value: new BigNumber(item.value),
          date: new Date(item.date * 1000)
        }))
      ),
      catchError((e: unknown) => {
        console.error(e);
        return of([]);
      })
    );
  }
}
