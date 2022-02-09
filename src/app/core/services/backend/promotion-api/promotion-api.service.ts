import { Injectable } from '@angular/core';
import { HttpService } from '@core/services/http/http.service';
import { forkJoin, Observable, of } from 'rxjs';
import { PromotionTableData } from '@features/promotion/models/promotion-table-data-item.interface';
import { first, map, switchMap } from 'rxjs/operators';
import { PromotionStatistics } from '@features/promotion/models/promotion-statistics.interface';
import { TokensService } from '@core/services/tokens/tokens.service';
import { AuthService } from '@core/services/auth/auth.service';
import { UnknownError } from '@core/errors/models/unknown.error';
import { PromoResponse } from '@core/services/backend/promotion-api/models/promo-response';
import { StatisticResponse } from '@core/services/backend/promotion-api/models/statistic-response';

@Injectable({
  providedIn: 'root'
})
export class PromotionApiService {
  private static baseUrl = 'promo/';

  constructor(
    private readonly httpService: HttpService,
    private readonly tokensService: TokensService,
    private readonly authService: AuthService
  ) {}

  /**
   * Fetches promotion table data.
   */
  public getPromotionTableData(): Observable<PromotionTableData> {
    const tokens$ = this.tokensService.tokens$.pipe(first());
    const projects$ = this.sendAuthorizedRequest<PromotionTableData>('projects');
    return forkJoin([tokens$, projects$]).pipe(
      switchMap(([_, projects]) => {
        // TODO find token or fetch token by address
        return of(projects);
      })
    );
  }

  /**
   * Fetches promotion statistics.
   */
  public getPromotionStatistics(): Observable<PromotionStatistics> {
    const defaultStatistics: PromotionStatistics = {
      integratedProjectsNumber: 0,
      totalRewards: 0,
      instantRewards: 0
    };

    return this.sendAuthorizedRequest<StatisticResponse>('statistic').pipe(
      map(response => {
        if (typeof response !== 'object') {
          return defaultStatistics;
        }
        return response as PromotionStatistics;
      })
    );
  }

  /**
   * Fetches or creates promo code by user address
   */
  public getPromoCode(): Observable<string> {
    return this.sendAuthorizedRequest<PromoResponse>('promo').pipe(
      map(response => response.promocode)
    );
  }

  /**
   * Fetches promoter wallet address by promo code
   */
  public getPromoterWalletAddress(promocode: string): Observable<string> {
    return this.httpService.get(PromotionApiService.baseUrl + 'promoter', { promocode });
  }

  private sendAuthorizedRequest<T>(endpoint: string): Observable<T> {
    const walletAddress = this.authService.userAddress;
    if (!walletAddress) {
      throw new UnknownError(`Api endpoint ${endpoint} can be used only for authorized users.`);
    }

    return this.httpService.get(PromotionApiService.baseUrl + endpoint, { walletAddress });
  }
}
