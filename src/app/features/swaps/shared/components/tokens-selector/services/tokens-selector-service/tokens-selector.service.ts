import { Injectable } from '@angular/core';
import { AvailableTokenAmount } from '@shared/models/tokens/available-token-amount';
import { BehaviorSubject, Subject } from 'rxjs';
import { TokensService } from '@core/services/tokens/tokens.service';
import { FormType } from '@features/swaps/shared/models/form/form-type';
import { TokensSelectComponentInput } from '@features/swaps/shared/components/tokens-selector/models/tokens-select-polymorpheus-data';
import { SelectorListType } from '@features/swaps/shared/components/tokens-selector/models/selector-list-type';
import { SwapFormService } from '@features/swaps/core/services/swap-form-service/swap-form.service';
import { FromAssetType } from '@features/swaps/shared/models/form/asset';
import { filter } from 'rxjs/operators';

@Injectable()
export class TokensSelectorService {
  private _formType: FormType;

  public get formType(): FormType {
    return this._formType;
  }

  // todo rename
  private readonly _blockchain$ = new BehaviorSubject<FromAssetType>(undefined);

  public readonly blockchain$ = this._blockchain$.asObservable();

  public get blockchain(): FromAssetType {
    return this._blockchain$.value;
  }

  public set blockchain(value: FromAssetType) {
    this._blockchain$.next(value);
  }

  private readonly _tokenSelected$ = new Subject<AvailableTokenAmount>();

  public readonly tokenSelected$ = this._tokenSelected$.asObservable();

  private readonly _selectorListType$ = new BehaviorSubject<SelectorListType>('tokens');

  public readonly selectorListType$ = this._selectorListType$.asObservable();

  public get selectorListType(): SelectorListType {
    return this._selectorListType$.value;
  }

  private set selectorListType(value: SelectorListType) {
    this._selectorListType$.next(value);
  }

  constructor(
    private readonly tokensService: TokensService,
    private readonly swapFormService: SwapFormService
  ) {
    this.subscribeOnBlockchainChange();
  }

  public initParameters(context: Omit<TokensSelectComponentInput, 'idPrefix'>): void {
    this._formType = context.formType;

    const blockchainType = this.formType === 'from' ? 'fromAssetType' : 'toBlockchain';
    this.blockchain = this.swapFormService.inputValue[blockchainType];
  }

  private subscribeOnBlockchainChange(): void {
    this.blockchain$.pipe(filter(Boolean)).subscribe(blockchain => {
      const tokenType = this.formType === 'from' ? 'fromAsset' : 'toToken';
      if (!this.swapFormService.inputValue[tokenType]) {
        const blockchainType = this.formType === 'from' ? 'fromAssetType' : 'toBlockchain';
        if (this.swapFormService.inputValue[blockchainType] !== blockchain) {
          this.swapFormService.inputControl.patchValue({
            [blockchainType]: this.blockchain
          });
        }
      }

      this.checkAndRefetchTokenList();
    });
  }

  private checkAndRefetchTokenList(): void {
    if (this.tokensService.needRefetchTokens) {
      this.tokensService.tokensRequestParameters = undefined;
    }
  }

  public switchSelectorType(): void {
    this.selectorListType = this.selectorListType === 'blockchains' ? 'tokens' : 'blockchains';
  }

  public onTokenSelect(token: AvailableTokenAmount): void {
    this._tokenSelected$.next(token);
  }
}
