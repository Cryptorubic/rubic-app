import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest, firstValueFrom, Observable, of, timer } from 'rxjs';
import { AvailableTokenAmount } from '@shared/models/tokens/available-token-amount';
import { TokenSecurity } from '@shared/models/tokens/token-security';
import { BLOCKCHAIN_NAME, BlockchainName, BlockchainsInfo, EvmWeb3Pure } from 'rubic-sdk';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import {
  catchError,
  distinctUntilChanged,
  filter,
  map,
  switchMap,
  takeUntil,
  tap
} from 'rxjs/operators';
import { Token as SdkToken } from 'rubic-sdk/lib/common/tokens/token';
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
import { AssetType } from '@app/features/trade/models/asset';
import { TokensUpdaterService } from '../../../../../../core/services/tokens/tokens-updater.service';
import { TokensListBuilder } from './utils/tokens-list-builder';

@Injectable()
export class TokensListStoreService {
  private readonly _searchLoading$ = new BehaviorSubject<boolean>(false);

  public readonly searchLoading$ = this._searchLoading$.asObservable();

  public get searchLoading(): boolean {
    return this._searchLoading$.value;
  }

  public set searchLoading(value: boolean) {
    this._searchLoading$.next(value);
  }

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
    const assetType = this.assetsSelectorService.assetType;
    if (!BlockchainsInfo.isBlockchainName(assetType)) {
      return null;
    }
    return assetType;
  }

  private get listType(): TokensListType {
    return this.tokensListTypeService.listType;
  }

  constructor(
    private readonly tokensListTypeService: TokensListTypeService,
    private readonly searchQueryService: SearchQueryService,
    private readonly tokensService: TokensService,
    private readonly tokensStoreService: TokensStoreService,
    private readonly assetsSelectorService: AssetsSelectorService,
    private readonly httpClient: HttpClient,
    private readonly swapFormService: SwapsFormService,
    private readonly destroy$: TuiDestroyService,
    private readonly tokensUpdaterService: TokensUpdaterService
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
    combineLatest([this.searchQueryService.query$, this.assetsSelectorService.selectorListType$])
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
        switchMap(() => {
          if (this.searchQuery.length) {
            if (this.listType === 'default') {
              return this.getDefaultTokensByQuery();
            } else {
              return of({ tokensToShow: this.getFilteredFavoriteTokens() });
            }
          }
          return of({ tokensToShow: this.getSortedTokens() });
        }),
        takeUntil(this.destroy$)
      )
      .subscribe((tokensList: TokensList) => {
        if ('tokensToShow' in tokensList) {
          this.tokensToShow = tokensList.tokensToShow;
          this.customToken = null;
        } else {
          this.tokensToShow = [];
          this.customToken = tokensList.customToken;
        }
        this.searchLoading = false;
      });
  }

  /**
   * Handles search query requests to APIs and gets parsed tokens.
   */
  private getDefaultTokensByQuery(): Observable<TokensList> {
    return timer(300).pipe(
      tap(() => (this.searchLoading = true)),
      switchMap(() => this.tryParseQueryAsBackendTokens()),
      switchMap(async backendTokens => {
        if (backendTokens?.length) {
          return { tokensToShow: backendTokens };
        }

        const customToken = await this.tryParseQueryAsCustomToken();
        if (customToken) {
          return { customToken };
        }

        return { tokensToShow: [] };
      })
    );
  }

  /**
   * Fetches tokens form backend by search query.
   */
  private tryParseQueryAsBackendTokens(): Observable<AvailableTokenAmount[]> {
    if (!this.searchQuery) return of([]);

    return this.tokensService.fetchQueryTokens(this.searchQuery, this.blockchain).pipe(
      map(backendTokens => {
        if (backendTokens.size) {
          const tlb = new TokensListBuilder(
            this.tokensStoreService,
            this.assetsSelectorService,
            this.swapFormService
          );

          return tlb.initList(this.listType, backendTokens).applySortByTokenRank().toArray();
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
        const token = await SdkToken.createToken({
          blockchain: this.blockchain,
          address
        });

        if (token?.name && token?.symbol && token?.decimals) {
          const image = await this.fetchTokenImage(token);

          return {
            ...token,
            image,
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
      ? EvmWeb3Pure.toChecksumAddress(token.address)
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

  private getFilteredFavoriteTokens(): AvailableTokenAmount[] {
    const query = this.searchQuery.toLowerCase();
    const tlb = new TokensListBuilder(
      this.tokensStoreService,
      this.assetsSelectorService,
      this.swapFormService
    );

    if (this.assetsSelectorService.assetType === 'allChains') {
      return tlb
        .initList(this.listType)
        .applyFilterBySearchQueryOnClient(query)
        .applyDefaultSort()
        .toArray();
    }

    return tlb
      .applyFilterByChain(this.blockchain)
      .applyFilterBySearchQueryOnClient(query)
      .applyDefaultSort()
      .toArray();
  }

  /**
   * Gets sorted list of default or favorite tokens.
   */
  private getSortedTokens(): AvailableTokenAmount[] {
    const tlb = new TokensListBuilder(
      this.tokensStoreService,
      this.assetsSelectorService,
      this.swapFormService
    );

    if (this.assetsSelectorService.assetType === 'allChains') {
      return tlb.initList(this.listType).applyDefaultSort().toArray();
    }

    return tlb
      .initList(this.listType)
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
      this.assetsSelectorService.formType === 'from' ? 'toToken' : 'fromToken';
    const oppositeAsset = this.swapFormService.inputValue[oppositeAssetTypeKey];
    return isMinimalToken(oppositeAsset) ? oppositeAsset : null;
  }

  private getTokenSecurity(token: BlockchainToken): Promise<TokenSecurity> {
    return this.tokensService.fetchTokenSecurity(token.address, token.blockchain);
  }

  public isBalanceLoading$(blockchain: AssetType): Observable<boolean> {
    return this.tokensStoreService.isBalanceLoading$(blockchain);
  }
}
