import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AvailableTokenAmount } from '@shared/models/tokens/available-token-amount';
import { BlockchainName, BlockchainsInfo } from '@cryptorubic/sdk';
import { HttpClient } from '@angular/common/http';

import { TuiDestroyService } from '@taiga-ui/cdk';
import { SwapsFormService } from '@features/trade/services/swaps-form/swaps-form.service';
import { SearchQueryService } from '@features/trade/components/assets-selector/services/search-query-service/search-query.service';
import { TokensListType } from '@features/trade/components/assets-selector/models/tokens-list-type';
import { TokensListTypeService } from '@features/trade/components/assets-selector/services/tokens-list-service/tokens-list-type.service';
import { AssetsSelectorService } from '@features/trade/components/assets-selector/services/assets-selector-service/assets-selector.service';
import { AssetsSelectorStateService } from '../assets-selector-state/assets-selector-state.service';
import { TokenFilter } from '../../models/token-filters';

@Injectable()
export class TokensListStoreService {
  private readonly _tokensToShow$ = new BehaviorSubject<AvailableTokenAmount[]>([]);

  public readonly tokensToShow$ = this._tokensToShow$.asObservable();

  public get tokensToShow(): AvailableTokenAmount[] {
    return this._tokensToShow$.value;
  }

  private set tokensToShow(value: AvailableTokenAmount[]) {
    this._tokensToShow$.next(value);
  }

  private readonly _customToken$ = new BehaviorSubject<AvailableTokenAmount>(undefined);

  public readonly customToken$ = this._customToken$.asObservable();

  public get customToken(): AvailableTokenAmount {
    return this._customToken$.value;
  }

  private set customToken(value: AvailableTokenAmount) {
    this._customToken$.next(value);
  }

  private get searchQuery(): string {
    return this.searchQueryService.query;
  }

  private get blockchain(): BlockchainName | null {
    const assetType = this.assetsSelectorStateService.assetType;
    if (!BlockchainsInfo.isBlockchainName(assetType)) {
      return null;
    }
    return assetType;
  }

  private get listType(): TokensListType {
    return this.tokensListTypeService.listType;
  }

  private get tokenFilter(): TokenFilter {
    return this.assetsSelectorStateService.tokenFilter;
  }

  constructor(
    private readonly tokensListTypeService: TokensListTypeService,
    private readonly searchQueryService: SearchQueryService,
    private readonly assetsSelectorService: AssetsSelectorService,
    private readonly assetsSelectorStateService: AssetsSelectorStateService,
    private readonly httpClient: HttpClient,
    private readonly swapFormService: SwapsFormService,
    private readonly destroy$: TuiDestroyService
  ) {}
}
