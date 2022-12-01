import { Injectable } from '@angular/core';
import { catchError, debounceTime, map, skip, switchMap, tap } from 'rxjs/operators';
import { compareAddresses, compareTokens } from '@shared/utils/utils';
import { AvailableTokenAmount } from '@shared/models/tokens/available-token-amount';
import { BehaviorSubject, combineLatest, firstValueFrom, Observable, of, Subject } from 'rxjs';
import { BlockchainName, BlockchainsInfo, EvmWeb3Pure, Token as SdkToken } from 'rubic-sdk';
import { TokensService } from '@core/services/tokens/tokens.service';
import { FormType } from '@features/swaps/shared/models/form/form-type';
import { FormGroup } from '@ngneat/reactive-forms';
import { ISwapFormInput } from '@shared/models/swaps/swap-form';
import { Token } from '@shared/models/tokens/token';
import BigNumber from 'bignumber.js';
import { BlockchainToken } from '@shared/models/tokens/blockchain-token';
import { DEFAULT_TOKEN_IMAGE } from '@shared/constants/tokens/default-token-image';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { blockchainImageKey } from '@features/swaps/shared/components/tokens-select/services/tokens-selector-service/constants/blockchain-image-key';
import { TokensSelectComponentInput } from '@features/swaps/shared/components/tokens-select/models/tokens-select-polymorpheus-data';
import { TokensListType } from '@features/swaps/shared/components/tokens-select/models/tokens-list-type';

@Injectable()
export class TokensSelectorService {
  /**
   * Contains string in search bar.
   */
  private readonly _searchQuery$ = new BehaviorSubject<string>('');

  public readonly searchQuery$ = this._searchQuery$.asObservable();

  public get searchQuery(): string {
    return this._searchQuery$.value;
  }

  public set searchQuery(value: string) {
    this._searchQuery$.next(value);
  }

  private readonly _searchLoading$ = new BehaviorSubject<boolean>(false);

  public readonly searchLoading$ = this._searchLoading$.asObservable();

  private set searchLoading(value: boolean) {
    this._searchLoading$.next(value);
  }

  /**
   * Form containing selected tokens and blockchains.
   */
  private form: FormGroup<ISwapFormInput>;

  public formType: FormType;

  private readonly _blockchain$ = new BehaviorSubject<BlockchainName>(undefined);

  public readonly blockchain$ = this._blockchain$.asObservable();

  public get blockchain(): BlockchainName {
    return this._blockchain$.value;
  }

  public set blockchain(value: BlockchainName) {
    this._blockchain$.next(value);
  }

  private readonly updateTokensByQuery$ = new Subject<void>();

  private readonly _tokens$ = new BehaviorSubject<AvailableTokenAmount[]>([]);

  public readonly tokens$ = this._tokens$.asObservable();

  private set tokens(value: AvailableTokenAmount[]) {
    this._tokens$.next(value);
  }

  private readonly _favoriteTokens$ = new BehaviorSubject<AvailableTokenAmount[]>([]);

  public readonly favoriteTokens$ = this._favoriteTokens$.asObservable();

  private set favoriteTokens(value: AvailableTokenAmount[]) {
    this._favoriteTokens$.next(value);
  }

  /**
   * Defines whether default or favorite tokens are shown.
   */
  private readonly _listType$ = new BehaviorSubject<TokensListType>('default');

  public readonly listType$ = this._listType$.asObservable();

  public get listType(): TokensListType {
    return this._listType$.value;
  }

  public set listType(value: TokensListType) {
    this._listType$.next(value);
  }

  private readonly _customToken$ = new BehaviorSubject<AvailableTokenAmount>(undefined);

  public readonly customToken$ = this._customToken$.asObservable();

  public get customToken(): AvailableTokenAmount {
    return this._customToken$.value;
  }

  private set customToken(value: AvailableTokenAmount) {
    this._customToken$.next(value);
  }

  private readonly _tokenSelected$ = new Subject<AvailableTokenAmount>();

  public readonly tokenSelected$ = this._tokenSelected$.asObservable();

  constructor(
    private readonly tokensService: TokensService,
    private readonly httpClient: HttpClient
  ) {
    this.subscribeOnUpdateTokensByQuery();

    this.subscribeOnTokensChange();
    this.subscribeOnSearchQueryChange();
    this.subscribeOnBlockchainChange();
  }

  public initParameters(context: Omit<TokensSelectComponentInput, 'idPrefix'>): void {
    this.form = context.form;
    this.formType = context.formType;

    const blockchainType = this.formType === 'from' ? 'fromBlockchain' : 'toBlockchain';
    this.blockchain = this.form.value[blockchainType];
  }

  private subscribeOnTokensChange(): void {
    combineLatest([this.tokensService.tokens$, this.tokensService.favoriteTokens$])
      .pipe(debounceTime(100))
      .subscribe(() => this.updateTokensList());
  }

  private subscribeOnSearchQueryChange(): void {
    this._searchQuery$.pipe(skip(1)).subscribe(() => {
      this.updateTokensList();
    });
  }

  private subscribeOnBlockchainChange(): void {
    this.blockchain$.subscribe(blockchain => {
      if (!blockchain) {
        return;
      }

      const tokenType = this.formType === 'from' ? 'fromToken' : 'toToken';
      if (!this.form.value[tokenType]) {
        const blockchainType = this.formType === 'from' ? 'fromBlockchain' : 'toBlockchain';
        if (this.form.value[blockchainType] !== blockchain) {
          this.form.patchValue({
            [blockchainType]: this.blockchain
          });
        }
      }

      this.updateTokensList();
      this.checkAndRefetchTokenList();
    });
  }

  /**
   * Updates default and favourite tokens lists.
   */
  private updateTokensList(): void {
    if (this.searchQuery.length) {
      if (this.listType === 'default') {
        this.updateTokensByQuery$.next();
      } else {
        this.filterFavoriteTokens();
      }
    } else {
      this.sortTokens();
      this.customToken = null;
    }
  }

  /**
   * Handles search query requests to APIs.
   */
  private subscribeOnUpdateTokensByQuery(): void {
    this.updateTokensByQuery$
      .pipe(
        debounceTime(300),
        tap(() => (this.searchLoading = true)),
        switchMap(() => this.tryParseQueryAsBackendTokens()),
        switchMap(async backendTokens => {
          if (backendTokens?.length) {
            return { backendTokens, customToken: null };
          }
          const customToken = await this.tryParseQueryAsCustomToken();
          return { tokens: null, customToken };
        })
      )
      .subscribe(({ backendTokens, customToken }) => {
        if (backendTokens) {
          this.tokens = backendTokens;
        } else if (customToken) {
          this.customToken = customToken;
        } else {
          this.tokens = [];
        }
        this.searchLoading = false;
      });
  }

  /**
   * Fetches tokens form backend by search query.
   */
  private tryParseQueryAsBackendTokens(): Observable<AvailableTokenAmount[]> {
    if (!this.searchQuery) {
      return of([]);
    }

    return this.tokensService.fetchQueryTokens(this.searchQuery, this.blockchain).pipe(
      map(backendTokens => {
        if (backendTokens.size) {
          return backendTokens
            .map(token => {
              return {
                ...token,
                available: this.isTokenAvailable(token),
                favorite: this.isTokenFavorite(token)
              };
            })
            .toArray();
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
      if (this.searchQuery) {
        const token = await SdkToken.createToken({
          blockchain: this.blockchain,
          address: this.searchQuery
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
            favorite: this.isTokenFavorite(token)
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

  /**
   * Filters favorite tokens by blockchain and query.
   */
  private filterFavoriteTokens(): void {
    const allFavoriteTokens = this.tokensService.favoriteTokens.toArray();

    const query = this.searchQuery.toLowerCase();
    const filteredFavoriteTokens = allFavoriteTokens
      .filter(token => token.blockchain === this.blockchain)
      .map(token => ({
        ...token,
        available: this.isTokenAvailable(token),
        favorite: true
      }));

    if (query.startsWith('0x')) {
      this.favoriteTokens = filteredFavoriteTokens.filter(token =>
        token.address.toLowerCase().includes(query)
      );
    } else {
      const symbolMatchingTokens = filteredFavoriteTokens.filter(token =>
        token.symbol.toLowerCase().includes(query)
      );
      const nameMatchingTokens = filteredFavoriteTokens.filter(token =>
        token.name.toLowerCase().includes(query)
      );

      this.favoriteTokens = symbolMatchingTokens.concat(
        nameMatchingTokens.filter(nameToken =>
          symbolMatchingTokens.every(
            symbolToken => !compareAddresses(nameToken.address, symbolToken.address)
          )
        )
      );
    }
  }

  private isTokenFavorite(token: BlockchainToken): boolean {
    return this.tokensService.favoriteTokens.some(favoriteToken =>
      compareTokens(favoriteToken, token)
    );
  }

  private isTokenAvailable(token: BlockchainToken): boolean {
    const oppositeToken = this.oppositeToken();
    return !oppositeToken || !compareTokens(oppositeToken, token);
  }

  private oppositeToken(): Token {
    const oppositeTokenType = this.formType === 'from' ? 'toToken' : 'fromToken';
    return this.form.value[oppositeTokenType];
  }

  /**
   * Sorts favorite and default lists of tokens.
   */
  private sortTokens(): void {
    const tokens = this.tokensService.tokens.toArray();
    const favoriteTokens = this.tokensService.favoriteTokens.toArray();

    const currentBlockchainTokens = tokens
      .filter(token => token.blockchain === this.blockchain)
      .map(token => ({
        ...token,
        available: this.isTokenAvailable(token),
        favorite: this.isTokenFavorite(token)
      }));
    this.tokens = this.sortTokensByComparator(currentBlockchainTokens);

    const currentBlockchainFavoriteTokens = favoriteTokens
      .filter((token: AvailableTokenAmount) => token.blockchain === this.blockchain)
      .map(token => ({
        ...token,
        available: this.isTokenAvailable(token),
        favorite: true
      }));
    this.favoriteTokens = this.sortTokensByComparator(currentBlockchainFavoriteTokens);
  }

  /**
   * Sorts tokens by comparator.
   * @param tokens Tokens to perform with.
   * @return AvailableTokenAmount[] Filtered and sorted tokens.
   */
  private sortTokensByComparator(tokens: AvailableTokenAmount[]): AvailableTokenAmount[] {
    const comparator = (a: AvailableTokenAmount, b: AvailableTokenAmount) => {
      const aAmount = a.amount.isFinite() ? a.amount : new BigNumber(0);
      const bAmount = b.amount.isFinite() ? b.amount : new BigNumber(0);
      const amountsDelta = bAmount.minus(aAmount).toNumber();
      return Number(b.available) - Number(a.available) || amountsDelta || b.rank - a.rank;
    };
    return tokens.sort(comparator);
  }

  private checkAndRefetchTokenList(): void {
    if (this.tokensService.needRefetchTokens) {
      this.tokensService.tokensRequestParameters = undefined;
    }
  }

  public switchListType(): void {
    if (this.listType === 'default') {
      this.listType = 'favorite';
    } else {
      this.listType = 'default';
    }
    this.searchQuery = '';
  }

  public onTokenSelect(token: AvailableTokenAmount): void {
    this._tokenSelected$.next(token);
  }
}
