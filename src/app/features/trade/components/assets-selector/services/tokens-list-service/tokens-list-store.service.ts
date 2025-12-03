import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest, firstValueFrom, Observable, of, timer } from 'rxjs';
import { AvailableTokenAmount } from '@shared/models/tokens/available-token-amount';
import { TokenSecurity } from '@shared/models/tokens/token-security';
import { BLOCKCHAIN_NAME, BlockchainName, BlockchainsInfo } from '@cryptorubic/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import {
  catchError,
  concatMap,
  debounceTime,
  distinctUntilChanged,
  filter,
  finalize,
  map,
  switchMap,
  takeUntil,
  tap
} from 'rxjs/operators';
import BigNumber from 'bignumber.js';
import { BlockchainToken } from '@shared/models/tokens/blockchain-token';
import { DEFAULT_TOKEN_IMAGE } from '@shared/constants/tokens/default-token-image';
import { compareTokens } from '@shared/utils/utils';
import { Token } from '@shared/models/tokens/token';
import { isMinimalToken } from '@shared/utils/is-token';
import { TokensStoreService } from '@core/services/tokens/tokens-store.service';
import { TokensService } from '@app/core/services/tokens/tokens.service';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { SwapsFormService } from '@features/trade/services/swaps-form/swaps-form.service';
import { SearchQueryService } from '@features/trade/components/assets-selector/services/search-query-service/search-query.service';
import { TokensListType } from '@features/trade/components/assets-selector/models/tokens-list-type';
import { TokensListTypeService } from '@features/trade/components/assets-selector/services/tokens-list-service/tokens-list-type.service';
import { AssetsSelectorService } from '@features/trade/components/assets-selector/services/assets-selector-service/assets-selector.service';
import { TokensList } from '@features/trade/components/assets-selector/services/tokens-list-service/models/tokens-list';
import { blockchainImageKey } from '@features/trade/components/assets-selector/services/tokens-list-service/constants/blockchain-image-key';
import { TokensUpdaterService } from '../../../../../../core/services/tokens/tokens-updater.service';
import { TokensListBuilder } from './utils/tokens-list-builder';
import { AssetsSelectorStateService } from '../assets-selector-state/assets-selector-state.service';
import { TOKEN_FILTERS, TokenFilter } from '../../models/token-filters';
import { TokenConvertersService } from '@app/core/services/tokens/token-converters.service';
import { EvmAdapter } from '@cryptorubic/web3';
import { SdkLegacyService } from '@app/core/services/sdk/sdk-legacy/sdk-legacy.service';

@Injectable()
export class TokensListStoreService {
  private readonly _tokensToShow$ = new BehaviorSubject<AvailableTokenAmount[]>([]);

  public readonly tokensToShow$ = this._tokensToShow$.asObservable();
  // .pipe(tap(t => console.log('%cTOKENS_TO_SHOW', 'color: red;', t)));

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
    private readonly tokensService: TokensService,
    private readonly tokensStoreService: TokensStoreService,
    private readonly assetsSelectorService: AssetsSelectorService,
    private readonly assetsSelectorStateService: AssetsSelectorStateService,
    private readonly httpClient: HttpClient,
    private readonly swapFormService: SwapsFormService,
    private readonly destroy$: TuiDestroyService,
    private readonly tokensUpdaterService: TokensUpdaterService,
    private readonly tokenConverters: TokenConvertersService,
    private readonly sdkLegacyService: SdkLegacyService
  ) {
    this.subscribeOnUpdateTokens();
    this.subscribeOnTokensChange();
    this.subscribeOnSearchQueryChange();
    this.subscribeOnBlockchainChange();
    this.subscribeOnListType();
  }

  private subscribeOnTokensChange(): void {
    combineLatest([this.tokensStoreService.tokens$, this.tokensStoreService.favoriteTokens$])
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        if (!this.searchQuery) {
          this.tokensUpdaterService.triggerUpdateTokens();
        }
      });
  }

  private subscribeOnSearchQueryChange(): void {
    combineLatest([
      this.searchQueryService.query$,
      this.assetsSelectorStateService.selectorListType$
    ])
      .pipe(
        filter(([_, selectorListType]) => selectorListType === 'tokens'),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.tokensUpdaterService.triggerUpdateTokens();
      });
  }

  private subscribeOnBlockchainChange(): void {
    this.assetsSelectorService.assetType$
      .pipe(distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(() => {
        this.tokensUpdaterService.triggerUpdateTokens();
      });
  }

  private subscribeOnListType(): void {
    this.tokensListTypeService.listType$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.searchQueryService.setSearchQuery('');
      this.tokensUpdaterService.triggerUpdateTokens();
    });
  }

  /**
   * Handles tokens list update.
   * Can be called only from constructor.
   */
  private subscribeOnUpdateTokens(): void {
    this.tokensUpdaterService.updateTokensList$
      .pipe(
        tap(),
        switchMap(({ skipRefetch }) => {
          if (this.searchQuery.length) {
            if (this.listType === 'default') {
              return this.getDefaultTokensByQuery(skipRefetch);
            } else {
              return of({ tokensToShow: this.getFavoriteTokensByQuery() });
            }
          }
          return of({ tokensToShow: this.getSortedTokens() });
        }),
        takeUntil(this.destroy$)
      )
      .subscribe((tokensList: TokensList) => {
        console.log('%ctokensList', 'color: yellow;', tokensList);
        if ('tokensToShow' in tokensList) {
          this.tokensToShow = tokensList.tokensToShow;
          this.customToken = null;
        } else {
          this.tokensToShow = [];
          this.customToken = tokensList.customToken;
        }
      });
  }

  /**
   * Handles search query requests to APIs and gets parsed tokens.
   */
  private getDefaultTokensByQuery(skipRefetch?: boolean): Observable<TokensList> {
    if (
      this.assetsSelectorStateService.assetType === 'allChains' &&
      this.assetsSelectorStateService.tokenFilter !== TOKEN_FILTERS.ALL_CHAINS_ALL_TOKENS
    ) {
      const query = this.searchQuery.toLowerCase();
      const tlb = new TokensListBuilder(
        this.tokensStoreService,
        this.assetsSelectorStateService,
        this.swapFormService,
        this.tokenConverters
      );

      return of({
        tokensToShow: tlb
          .initList()
          .applyFilterByQueryOnClient(query)
          .applySortByTokenRank()
          .toArray()
      });
    }

    return timer(300).pipe(
      distinctUntilChanged(),
      debounceTime(200),
      tap(() => this.tokensUpdaterService.setTokensLoading(true)),
      concatMap(() => this.tryParseQueryAsBackendTokens(skipRefetch)),
      switchMap(async backendTokens => {
        if (backendTokens?.length) {
          return { tokensToShow: backendTokens };
        }

        const customToken = await this.tryParseQueryAsCustomToken();
        if (customToken) {
          return { customToken };
        }

        return { tokensToShow: [] };
      }),
      finalize(() => this.tokensUpdaterService.setTokensLoading(false))
    );
  }

  /**
   * Fetches tokens form backend by search query.
   */
  private tryParseQueryAsBackendTokens(skipRefetch?: boolean): Observable<AvailableTokenAmount[]> {
    if (!this.searchQuery) return of([]);

    const tlb = new TokensListBuilder(
      this.tokensStoreService,
      this.assetsSelectorStateService,
      this.swapFormService,
      this.tokenConverters
    );

    // used to prevent infinite triggering this.tokensUpdaterService.updateTokensList$
    if (skipRefetch) {
      const sortedTokensToShow = tlb
        .initList(this.tokensStoreService.lastQueriedTokens)
        .applySortByTokenRank()
        .toArray();

      return of(sortedTokensToShow);
    }

    return this.tokensService
      .fetchQueryTokensDynamicallyAndPatch(this.searchQuery, this.blockchain)
      .pipe(
        map(backendTokens => {
          if (backendTokens.size) {
            return tlb.initList(backendTokens).applySortByTokenRank().toArray();
          }
          return [];
        })
      );
  }

  /**
   * Tries to parse custom token by search query requesting Web3.
   */
  private async tryParseQueryAsCustomToken(): Promise<AvailableTokenAmount> {
    try {
      if (this.searchQuery && this.blockchain) {
        const address =
          this.blockchain === BLOCKCHAIN_NAME.SOLANA
            ? this.searchQuery
            : this.searchQuery.toLowerCase();
        const token = await this.sdkLegacyService.tokenService.createToken({
          blockchain: this.blockchain,
          address
        });

        if (token?.name && token?.symbol && token?.decimals) {
          let image: string;
          if ('image' in token) image = token.image as string;
          if (!image) image = await this.fetchTokenImage(token).catch(() => DEFAULT_TOKEN_IMAGE);

          return {
            ...token,
            image: image,
            rank: 0,
            amount: new BigNumber(NaN),
            price: 0,
            available: this.isTokenAvailable(token),
            favorite: this.isTokenFavorite(token),
            tokenSecurity: await this.getTokenSecurity(token)
          };
        }
      }
    } catch {}
    return null;
  }

  /**
   * Fetches token's image url.
   * @param token Token to display.
   * @return Promise<string> Token image url.
   */
  private async fetchTokenImage(token: BlockchainToken): Promise<string> {
    const blockchainKey = blockchainImageKey[token.blockchain];
    if (!blockchainKey) {
      return DEFAULT_TOKEN_IMAGE;
    }

    const tokenAddress = BlockchainsInfo.isEvmBlockchainName(token.blockchain)
      ? EvmAdapter.toChecksumAddress(token.address)
      : token.address;
    const image = `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/${blockchainKey}/assets/${tokenAddress}/logo.png`;

    return firstValueFrom(
      this.httpClient.get<string>(image).pipe(
        catchError((err: unknown) => {
          return (err as HttpErrorResponse)?.status === 200 ? of(image) : of(DEFAULT_TOKEN_IMAGE);
        })
      )
    );
  }

  private getFavoriteTokensByQuery(): AvailableTokenAmount[] {
    const query = this.searchQuery.toLowerCase();
    const tlb = new TokensListBuilder(
      this.tokensStoreService,
      this.assetsSelectorStateService,
      this.swapFormService,
      this.tokenConverters
    );

    if (this.assetsSelectorStateService.assetType === 'allChains') {
      return tlb
        .initList()
        .applyShowFavoriteTokensIf(true)
        .applyFilterByQueryOnClient(query)
        .applyDefaultSort()
        .toArray();
    }

    return tlb
      .initList()
      .applyShowFavoriteTokensIf(true)
      .applyFilterByChain(this.blockchain)
      .applyFilterByQueryOnClient(query)
      .applyDefaultSort()
      .toArray();
  }

  /**
   * Gets sorted list of default or favorite tokens.
   */
  private getSortedTokens(): AvailableTokenAmount[] {
    const tlb = new TokensListBuilder(
      this.tokensStoreService,
      this.assetsSelectorStateService,
      this.swapFormService,
      this.tokenConverters
    );

    if (this.assetsSelectorStateService.assetType === 'allChains') {
      if (this.tokenFilter === TOKEN_FILTERS.ALL_CHAINS_TRENDING) {
        return tlb
          .initList()
          .applyShowFavoriteTokensIf(this.listType === 'favorite')
          .toArray();
      }
      if (this.tokenFilter === TOKEN_FILTERS.ALL_CHAINS_GAINERS) {
        return tlb
          .initList()
          .applyShowFavoriteTokensIf(this.listType === 'favorite')
          .applySortByMostGainer(this.tokenFilter)
          .toArray();
      }
      if (this.tokenFilter === TOKEN_FILTERS.ALL_CHAINS_LOSERS) {
        return tlb
          .initList()
          .applyShowFavoriteTokensIf(this.listType === 'favorite')
          .applySortByMostLoser(this.tokenFilter)
          .toArray();
      }

      return tlb
        .initList()
        .applyFilterOnlyWithBalancesAndTopTokens()
        .applyShowFavoriteTokensIf(this.listType === 'favorite')
        .applyDefaultSort()
        .toArray();
    }

    return tlb
      .initList()
      .applyShowFavoriteTokensIf(this.listType === 'favorite')
      .applyFilterByChain(this.blockchain)
      .applyDefaultSort()
      .toArray();
  }

  private isTokenFavorite(token: BlockchainToken): boolean {
    return this.tokensStoreService.favoriteTokens.some(favoriteToken =>
      compareTokens(favoriteToken, token)
    );
  }

  private isTokenAvailable(token: BlockchainToken): boolean {
    const oppositeToken = this.oppositeToken();
    return !oppositeToken || !compareTokens(oppositeToken, token);
  }

  private oppositeToken(): Token | null {
    const oppositeAssetTypeKey =
      this.assetsSelectorStateService.formType === 'from' ? 'toToken' : 'fromToken';
    const oppositeAsset = this.swapFormService.inputValue[oppositeAssetTypeKey];
    return isMinimalToken(oppositeAsset) ? oppositeAsset : null;
  }

  private getTokenSecurity(token: BlockchainToken): Promise<TokenSecurity> {
    if (BlockchainsInfo.isSolanaBlockchainName(token.blockchain)) {
      return null;
    }
    return this.tokensService.fetchTokenSecurity(token.address, token.blockchain);
  }
}
