import { Injectable } from '@angular/core';
import { BehaviorSubject, filter, first, map } from 'rxjs';
import { MAIN_FORM_TYPE, MainFormType } from './models';
import { SwapsFormService } from '@features/trade/services/swaps-form/swaps-form.service';
import { QueryParamsService } from '@core/services/query-params/query-params.service';
import { compareTokens } from '@shared/utils/utils';
import { QueryParams } from '@core/services/query-params/models/query-params';
import { TransferTokensService } from '@core/services/tokens/transfer-tokens.service';

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
    private readonly queryParamsService: QueryParamsService,
    private readonly transferTokensService: TransferTokensService
  ) {}

  public selectForm(type: MainFormType): void {
    if (this.selectedForm === type) {
      if (type === MAIN_FORM_TYPE.TRANSFER) {
        this.applyTransferTokenValidation();
      }
      return;
    }

    if (type === MAIN_FORM_TYPE.TRANSFER) {
      this.applyTransferTokenValidation();
    } else if (this.isTransferMode) {
      this.clearToTokenIfSameAsFrom();
    }

    this._selectedForm$.next(type);
    this.patchFormTypeQueryParam(type);
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

  private applyTransferTokenValidation(): void {
    if (this.transferTokensService.isLoaded) {
      this.validateAndSyncTransferToken();
      return;
    }

    this.transferTokensService.loaded$
      .pipe(
        filter(loaded => loaded),
        first()
      )
      .subscribe(() => this.validateAndSyncTransferToken());
  }

  private validateAndSyncTransferToken(): void {
    const { fromToken } = this.swapsFormService.inputValue;
    if (fromToken && !this.transferTokensService.hasToken(fromToken)) {
      this.swapsFormService.inputControl.patchValue({
        fromToken: null,
        toToken: null,
        fromBlockchain: null,
        toBlockchain: null
      });
      return;
    }

    this.syncToTokenWithFrom();
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

  private patchFormTypeQueryParam(type: MainFormType): void {
    this.queryParamsService.patchQueryParams({
      formType: type === MAIN_FORM_TYPE.SWAP ? null : type
    } as Partial<QueryParams>);
  }
}
