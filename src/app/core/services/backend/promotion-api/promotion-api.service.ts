import { Injectable } from '@angular/core';
import { HttpService } from '@core/services/http/http.service';
import { forkJoin, Observable, of } from 'rxjs';
import {
  PromotionTableData,
  PromotionTableDataItem
} from '@features/promotion/models/promotion-table-data-item.interface';
import { map, switchMap } from 'rxjs/operators';
import { PromotionStatistics } from '@features/promotion/models/promotion-statistics.interface';
import { TokensService } from '@core/services/tokens/tokens.service';
import { AuthService } from '@core/services/auth/auth.service';
import { UnknownError } from '@core/errors/models/unknown.error';
import { PromoResponse } from '@core/services/backend/promotion-api/models/promo-response';
import { StatisticResponse } from '@core/services/backend/promotion-api/models/statistic-response';
import {
  BackendPromoProject,
  ProjectsResponse
} from '@core/services/backend/promotion-api/models/projects-response';
import { TokensApiService } from '@core/services/backend/tokens-api/tokens-api.service';
import { FROM_BACKEND_BLOCKCHAINS } from '@shared/constants/blockchain/backend-blockchains';
import { Token } from '@shared/models/tokens/token';

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
    return this.sendAuthorizedRequest<ProjectsResponse>('projects').pipe(
      switchMap(projects => {
        const tokens$: Observable<Token>[] = projects.map(project => {
          if (project.token.symbol && project.token.name) {
            return of(TokensApiService.prepareTokens([project.token]).toArray()[0]);
          }
          return this.tokensService.addTokenByAddress(
            project.token.address,
            FROM_BACKEND_BLOCKCHAINS[project.token.blockchain_network]
          );
        });
        return forkJoin(tokens$).pipe(
          map(tokens =>
            tokens.map((token, index) =>
              this.convertBackendProjectAndTokenToTableItem(projects[index], token)
            )
          )
        );
      })
    );
  }

  /**
   * Fetches promotion statistics.
   */
  public getPromotionStatistics(): Observable<PromotionStatistics> {
    return this.sendAuthorizedRequest<StatisticResponse>('statistic').pipe(
      map(response => ({
        integratedProjectsNumber: parseInt(response.integratedProjectsCount),
        totalRewards: parseFloat(response.totalRewards),
        instantRewards: parseFloat(response.instantRewards)
      }))
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

  private convertBackendProjectAndTokenToTableItem(
    project: BackendPromoProject,
    token: Token
  ): PromotionTableDataItem {
    return {
      projectName: project.domain,
      projectUrl: project.domain,
      invitationDate: new Date(project.update_time),
      tradingVolume: parseFloat(project.trade_volume),
      received: parseFloat(project.promoter_comission),
      receivedTokens: parseFloat(project.promoter_comission_token),
      token
    };
  }
}
