import { Injectable } from '@angular/core';
import { Token } from '@shared/models/tokens/token';
import {
  BlockchainUtilityState,
  TokenRef,
  TokensState
} from '@core/services/tokens/models/new-token-types';
import { BLOCKCHAIN_NAME, BlockchainName, BlockchainsInfo } from '@cryptorubic/core';
import { BehaviorSubject, combineLatest, combineLatestWith, firstValueFrom, of } from 'rxjs';
import { BalanceToken } from '@shared/models/tokens/balance-token';
import { catchError, distinctUntilChanged, map, switchMap, tap } from 'rxjs/operators';
import BigNumber from 'bignumber.js';
import { NewTokensApiService } from '@core/services/tokens/new-tokens-api.service';
import { BlockchainToken } from '@shared/models/tokens/blockchain-token';
import { DEFAULT_TOKEN_IMAGE } from '@shared/constants/tokens/default-token-image';
import { blockchainImageKey } from '@features/trade/components/assets-selector/services/tokens-list-service/constants/blockchain-image-key';
import { EvmAdapter } from '@cryptorubic/web3';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { SdkLegacyService } from '@core/services/sdk/sdk-legacy/sdk-legacy.service';

@Injectable({
  providedIn: 'root'
})
export class NewTokensStoreService {
  public readonly tokens = this.createTokenStore();

  public allTokens$ = combineLatest([...Object.values(this.tokens).map(t => t.tokens$)]).pipe(
    map(([...allArrays]) => {
      const allTokens = allArrays.flat();
      return allTokens;
    })
  );

  constructor(
    private readonly apiService: NewTokensApiService,
    private readonly httpClient: HttpClient,
    private readonly sdkService: SdkLegacyService
  ) {}

  public addInitialBlockchainTokens(
    blockchain: BlockchainName,
    tokens: { list: Token[]; total: number; haveMore: boolean }
  ): void {
    try {
      const chainObject = this.tokens[blockchain];

      chainObject._pageLoading$.next(true);
      const currentTokens = chainObject._tokensObject$;

      tokens.list.forEach(token => {
        if (!currentTokens.value[token.address]) {
          currentTokens.value[token.address] = {
            ...token,
            favorite: false,
            amount: new BigNumber(NaN)
          };
        }
      });

      const newValues = tokens.list
        .sort((a, b) => {
          const aTotalRank = a.rank * (a?.networkRank || 1);
          const bTotalRank = b.rank * (b?.networkRank || 1);
          return aTotalRank > bTotalRank ? -1 : 1;
        })
        .reduce((acc, token) => ({ ...acc, [token.address]: token }), {});

      currentTokens.next({ ...currentTokens.value, ...newValues });
      chainObject._pageLoading$.next(false);
      chainObject.page = chainObject.page + 1;
      chainObject.totalTokens = tokens.total;
      chainObject.allowFetching = tokens.haveMore;
    } catch (err) {
      console.error(err);
    }
  }

  public addBlockchainBalanceTokens(
    blockchain: BlockchainName,
    balanceTokens: BalanceToken[]
  ): void {
    const tokens = this.tokens[blockchain]._tokensObject$;
    balanceTokens.forEach(token => {
      if (tokens.value[token.address]) {
        tokens.value[token.address] = { ...tokens.value?.[token.address], ...token };
      } else {
        tokens.value[token.address] = token;
      }
    });
    tokens.next(tokens.value);
  }

  public updateBlockchainTokens(blockchain: BlockchainName, newTokens: ReadonlyArray<Token>): void {
    const tokens = this.tokens[blockchain]._tokensObject$;
    newTokens.forEach(token => {
      if (tokens.value[token.address]) {
        tokens.value[token.address] = { ...tokens.value?.[token.address], ...token };
      } else {
        tokens.value[token.address] = { ...token, favorite: false, amount: new BigNumber(NaN) };
      }
    });
    tokens.next(tokens.value);
  }

  private createBlockchainUtilityStore(): BlockchainUtilityState {
    return Object.values(BLOCKCHAIN_NAME).reduce((acc, blockchain) => {
      const tokensSubject$ = new BehaviorSubject<Record<string, BalanceToken>>({});
      const loadingSubject$ = new BehaviorSubject(true);
      const balanceLoadingSubject$ = new BehaviorSubject(false);

      acc[blockchain] = {
        _pageLoading$: loadingSubject$,
        pageLoading$: loadingSubject$.asObservable(),

        _balanceLoading$: balanceLoadingSubject$,
        balanceLoading$: balanceLoadingSubject$.asObservable(),

        blockchain,

        _tokensObject$: tokensSubject$,
        tokensObject$: tokensSubject$.asObservable(),
        tokens$: tokensSubject$.asObservable().pipe(map(el => Object.values(el)))
      };
      return acc;
    }, {} as unknown as BlockchainUtilityState);
  }

  private createTokenStore(): TokensState {
    return Object.values(BLOCKCHAIN_NAME).reduce((acc, blockchain) => {
      const tokensSubject$ = new BehaviorSubject<Record<string, BalanceToken>>({});
      const loadingSubject$ = new BehaviorSubject(true);
      const balanceLoadingSubject$ = new BehaviorSubject(false);
      const searchRefsSubject$ = new BehaviorSubject<TokenRef[]>([]);
      const searchQuerySubject$ = new BehaviorSubject<string>('');
      const searchQuery$ = searchQuerySubject$.asObservable();

      acc[blockchain] = {
        _pageLoading$: loadingSubject$,
        pageLoading$: loadingSubject$.asObservable().pipe(distinctUntilChanged()),

        _balanceLoading$: balanceLoadingSubject$,
        balanceLoading$: balanceLoadingSubject$.asObservable().pipe(distinctUntilChanged()),

        blockchain,

        _tokensObject$: tokensSubject$,
        tokensObject$: tokensSubject$.asObservable(),
        tokens$: tokensSubject$.asObservable().pipe(
          combineLatestWith(searchQuery$),
          switchMap(([tokens, searchQuery]) => {
            const allTokens = Object.values(tokens);
            if (searchQuery && searchQuery.length >= 2) {
              const filteredTokens = allTokens.filter(
                token =>
                  token.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  token.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  token.address.toLowerCase().includes(searchQuery.toLowerCase())
              );
              return [filteredTokens];
            }
            return [allTokens];
          })
        ),

        _searchRefs$: searchRefsSubject$,
        searchRefs$: searchRefsSubject$.asObservable(),
        _searchQuery$: searchQuerySubject$,
        searchQuery$: searchQuery$,

        totalTokens: null,
        page: 0,
        allowFetching: true,
        getTokens: () => tokensSubject$.getValue()
      };
      return acc;
    }, {} as unknown as TokensState);
  }

  public getAllTokens(): BalanceToken[] {
    return Object.values(this.tokens).reduce((acc, chainStore) => {
      return [...acc, ...Object.values(chainStore._tokensObject$.getValue())];
    }, []);
  }

  public clearAllBalances(): void {
    Object.values(this.tokens).forEach(chainStore => {
      const tokens = chainStore._tokensObject$.getValue();
      Object.keys(tokens).forEach(address => {
        tokens[address].amount = new BigNumber(NaN);
      });
      chainStore._tokensObject$.next(tokens);
    });
  }

  public setQueryAndFetch(blockchain: BlockchainName, query: string): void {
    this.tokens[blockchain]._searchQuery$.next(query);
    if (query.length >= 2) {
      this.fetchQueryTokens(query, blockchain);
    }
  }

  private fetchQueryTokens(query: string, blockchain: BlockchainName): void {
    const tokensObject = this.tokens[blockchain];

    tokensObject._pageLoading$.next(true);
    this.apiService
      .fetchQueryTokens(query, blockchain)
      .pipe(
        switchMap(tokens =>
          tokens?.length ? of(tokens) : this.fetchCustomToken(query, blockchain)
        ),
        tap(tokens => {
          const refs = tokens.map(token => ({
            blockchain: token.blockchain,
            address: token.address
          }));
          tokensObject._searchRefs$.next(refs);

          const chainTokens: Partial<Record<BlockchainName, Token[]>> = {};
          tokens.forEach(token => {
            if (!chainTokens[token.blockchain]) {
              chainTokens[token.blockchain] = [];
            }
            chainTokens[token.blockchain].push(token);
          });
          Object.entries(chainTokens).forEach(
            ([chain, blockchainTokens]: [BlockchainName, Token[]]) => {
              this.updateBlockchainTokens(chain, blockchainTokens);
            }
          );

          tokensObject._pageLoading$.next(false);
        })
      )
      .subscribe();
  }

  private async fetchCustomToken(
    query: string,
    blockchain: BlockchainName
  ): Promise<Token[] | null> {
    try {
      if (query && blockchain) {
        const address = blockchain === BLOCKCHAIN_NAME.SOLANA ? query : query.toLowerCase();
        const token = await this.sdkService.tokenService.createToken({
          blockchain: blockchain,
          address
        });

        if (token?.name && token?.symbol && token?.decimals) {
          let image: string;
          if ('image' in token) image = token.image as string;
          if (!image) image = await this.fetchTokenImage(token).catch(() => DEFAULT_TOKEN_IMAGE);

          return [
            {
              ...token,
              image: image,
              rank: 0,
              price: 0,
              tokenSecurity: undefined
            }
          ];
        }
      }
    } catch {
      return [];
    }
    return [];
  }

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
}
