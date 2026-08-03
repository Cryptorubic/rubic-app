import { Injectable } from '@angular/core';
import { BehaviorSubject, map } from 'rxjs';
import { MAIN_FORM_TYPE, MainFormType } from './models';
import { SwapsFormService } from '@features/trade/services/swaps-form/swaps-form.service';
import { QueryParamsService } from '@core/services/query-params/query-params.service';
import { compareTokens } from '@shared/utils/utils';
import { QueryParams } from '@core/services/query-params/models/query-params';

@Injectable({ providedIn: 'root' })
export class FormsTogglerService {
  private _selectedForm$ = new BehaviorSubject<MainFormType>(MAIN_FORM_TYPE.SWAP);

  public readonly selectedForm$ = this._selectedForm$.asObservable();

  public readonly isTransferMode$ = this.selectedForm$.pipe(
    map(form => form === MAIN_FORM_TYPE.TRANSFER)
  );

  public get selectedForm(): MainFormType {
    return this._selectedForm$.getValue();
  }

  public get isTransferMode(): boolean {
    return this.selectedForm === MAIN_FORM_TYPE.TRANSFER;
  }

  constructor(
    private readonly swapsFormService: SwapsFormService,
    private readonly queryParamsService: QueryParamsService
  ) {}

  public selectForm(type: MainFormType): void {
    if (this.selectedForm === type) {
      return;
    }

    if (type === MAIN_FORM_TYPE.TRANSFER) {
      this.syncToTokenWithFrom();
    } else if (this.isTransferMode) {
      this.clearToTokenIfSameAsFrom();
    }

    this._selectedForm$.next(type);
    this.patchTradeModeQueryParam(type);
  }

  public syncToTokenWithFrom(): void {
    const { fromToken, fromBlockchain } = this.swapsFormService.inputValue;
    if (!fromToken) {
      return;
    }

    this.swapsFormService.inputControl.patchValue({
      toToken: fromToken,
      toBlockchain: fromBlockchain
    });
  }

  private clearToTokenIfSameAsFrom(): void {
    const { fromToken, toToken } = this.swapsFormService.inputValue;
    if (fromToken && toToken && compareTokens(fromToken, toToken)) {
      this.swapsFormService.inputControl.patchValue({
        toToken: null,
        toBlockchain: null
      });
    }
  }

  private patchTradeModeQueryParam(type: MainFormType): void {
    this.queryParamsService.patchQueryParams({
      tradeMode: type === MAIN_FORM_TYPE.SWAP ? null : type
    } as Partial<QueryParams>);
  }
}
