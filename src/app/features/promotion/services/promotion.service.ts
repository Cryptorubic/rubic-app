import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { PromotionTableData } from '@features/promotion/models/promotion-table-data-item.interface';
import { filter, map, share } from 'rxjs/operators';
import { notNull } from '@shared/utils/utils';
import { PromotionApiService } from '@features/promotion/services/promotion-api.service';
import { PromotionStatistics } from '@features/promotion/models/promotion-statistics.interface';
import { AuthService } from '@core/services/auth/auth.service';
import { WalletConnectorService } from '@core/services/blockchain/wallets/wallet-connector-service/wallet-connector.service';

@Injectable()
export class PromotionService {
  private readonly promoUrl = 'https://rubic.exchange/widget';

  private readonly defaultStatistics: PromotionStatistics = {
    integratedProjectsNumber: 0,
    totalRewards: 0,
    instantRewards: 0
  };

  private readonly _tableData$ = new BehaviorSubject<PromotionTableData | null>([]);

  public readonly tableData$ = this._tableData$.pipe(filter(notNull), share());

  public readonly isTableDataLoading$: Observable<boolean> = this._tableData$.pipe(
    map(value => !value),
    share()
  );

  private readonly _statistics$ = new BehaviorSubject<PromotionStatistics | null>(
    this.defaultStatistics
  );

  public readonly statistics$ = this._statistics$.pipe(filter(notNull), share());

  public readonly isStatisticsLoading$: Observable<boolean> = this._statistics$.pipe(
    map(value => !value),
    share()
  );

  private readonly _promoLink$ = new BehaviorSubject<string | null>('');

  public readonly promoLink$ = this._promoLink$.pipe(filter(notNull), share());

  public readonly isPromoLinkLoading$: Observable<boolean> = this._promoLink$.pipe(
    map(value => !value),
    share()
  );

  public get tableData(): PromotionTableData | null {
    return this._tableData$.getValue();
  }

  public get statistics(): PromotionStatistics | null {
    return this._statistics$.getValue();
  }

  public get promoLink(): string | null {
    return this._promoLink$.getValue();
  }

  constructor(
    private readonly promotionApiService: PromotionApiService,
    private readonly authService: AuthService,
    private readonly walletConnectorService: WalletConnectorService
  ) {
    this.setWalletSubscriptions();
  }

  public updatePromotionData(): void {
    this.setTableDataLoading();
    this.promotionApiService
      .getPromotionTableData()
      .subscribe(promotionData => this._tableData$.next(promotionData));
  }

  public updatePromotionStatistics(): void {
    this.setStatisticsLoading();
    this.promotionApiService
      .getPromotionStatistics()
      .subscribe(statistics => this._statistics$.next(statistics));
  }

  public updatePromoLink(): void {
    this.setPromoLinkLoading();
    this.promotionApiService
      .getPromoCode()
      .pipe(map(promoCode => `${this.promoUrl}?promoCode=${promoCode}`))
      .subscribe(promoLink => this._promoLink$.next(promoLink));
  }

  private setWalletSubscriptions(): void {
    this.authService
      .getCurrentUser()
      .pipe(map(user => !!user?.address))
      .subscribe(isAuthorized => {
        const isEthLikeWalletConnected =
          isAuthorized && this.walletConnectorService.provider.walletType === 'ethLike';
        if (isEthLikeWalletConnected) {
          this.updatePromotionData();
          this.updatePromotionStatistics();
          this.updatePromoLink();
        } else {
          this.setDefaultTableData();
          this.setDefaultStatistics();
          this.setDefaultPromoLink();
        }
      });
  }

  private setTableDataLoading(): void {
    if (this.tableData !== null) {
      this._tableData$.next(null);
    }
  }

  private setStatisticsLoading(): void {
    if (this.statistics !== null) {
      this._statistics$.next(null);
    }
  }

  private setPromoLinkLoading(): void {
    if (this.promoLink !== null) {
      this._statistics$.next(null);
    }
  }

  private setDefaultTableData(): void {
    this._tableData$.next([]);
  }

  private setDefaultStatistics(): void {
    this._statistics$.next(this.defaultStatistics);
  }

  private setDefaultPromoLink(): void {
    this._promoLink$.next('');
  }
}
