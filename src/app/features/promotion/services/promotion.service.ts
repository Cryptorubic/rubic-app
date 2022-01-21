import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { PromotionTableData } from '@features/promotion/models/promotion-table-data-item.interface';
import { filter, map, share } from 'rxjs/operators';
import { notNull } from '@shared/utils/utils';
import { PromotionApiService } from '@features/promotion/services/promotion-api.service';

@Injectable()
export class PromotionService {
  private readonly _tableData$ = new BehaviorSubject<PromotionTableData | null>(null);

  public readonly tableData$ = this._tableData$.pipe(filter(notNull), share());

  public readonly isLoading$: Observable<boolean> = this._tableData$.pipe(
    map(value => !value),
    share()
  );

  public get tableData(): PromotionTableData | null {
    return this._tableData$.getValue();
  }

  constructor(private promotionApiService: PromotionApiService) {
    this.updatePromotionData();
  }

  public updatePromotionData(): void {
    this.setLoading();
    this.promotionApiService
      .getPromotionData()
      .subscribe(promotionData => this._tableData$.next(promotionData));
  }

  private setLoading(): void {
    if (this.tableData) {
      this._tableData$.next(null);
    }
  }
}
