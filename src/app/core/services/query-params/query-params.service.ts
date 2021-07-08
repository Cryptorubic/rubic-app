import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { List } from 'immutable';
import { BehaviorSubject, forkJoin, Observable, of } from 'rxjs';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { filter, first, map, mergeMap } from 'rxjs/operators';
import { TOKEN_RANK } from 'src/app/shared/models/tokens/TOKEN_RANK';
import { TokensService } from 'src/app/core/services/tokens/tokens.service';
import { SwapFormService } from 'src/app/features/swaps/services/swaps-form-service/swap-form.service';
import { TokenAmount } from 'src/app/shared/models/tokens/TokenAmount';
import BigNumber from 'bignumber.js';
import { SwapsService } from 'src/app/features/swaps/services/swaps-service/swaps.service';
import { BlockchainsBridgeTokens } from 'src/app/features/bridge/models/BlockchainsBridgeTokens';
import { Web3PublicService } from '../blockchain/web3-public-service/web3-public.service';
import { Web3Public } from '../blockchain/web3-public-service/Web3Public';
import { QueryParams } from './models/query-params';

@Injectable({
  providedIn: 'root'
})
export class QueryParamsService {
  private static DEFAULT_PARAMETERS = {
    swap: {
      fromChain: BLOCKCHAIN_NAME.ETHEREUM,
      toChain: BLOCKCHAIN_NAME.ETHEREUM,
      from: {
        [BLOCKCHAIN_NAME.ETHEREUM]: 'ETH',
        [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: 'BNB',
        [BLOCKCHAIN_NAME.POLYGON]: 'MATIC'
      },
      to: {
        [BLOCKCHAIN_NAME.ETHEREUM]: 'RBC',
        [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: 'BRBC'
      },
      amount: '1'
    }
  };

  private readonly _isIframe$ = new BehaviorSubject<boolean>(false);

  public currentQueryParams: QueryParams;

  private readonly _hiddenNetworks$ = new BehaviorSubject<string[]>([]);

  private readonly _tokensSelectionDisabled$ = new BehaviorSubject<boolean>(false);

  private readonly _theme$ = new BehaviorSubject<string>('default');

  public get isIframe$(): Observable<boolean> {
    return this._isIframe$.asObservable();
  }

  public get theme$(): Observable<string> {
    return this._theme$.asObservable();
  }

  public get hiddenNetworks$(): Observable<string[]> {
    return this._hiddenNetworks$.asObservable();
  }

  public get tokensSelectionDisabled$(): Observable<boolean> {
    return this._tokensSelectionDisabled$.asObservable();
  }

  constructor(
    private readonly tokensService: TokensService,
    private readonly web3Public: Web3PublicService,
    @Inject(DOCUMENT) private document: Document,
    private readonly router: Router,
    private readonly swapFormService: SwapFormService,
    private readonly swapsService: SwapsService
  ) {
    this.swapFormService.commonTrade.controls.input.valueChanges.subscribe(value => {
      this.setQueryParams({
        ...(value.fromToken?.symbol && { from: value.fromToken.symbol }),
        ...(value.toToken?.symbol && { to: value.toToken.symbol }),
        ...(value.fromBlockchain && { fromChain: value.fromBlockchain }),
        ...(value.toBlockchain && { toChain: value.toBlockchain }),
        ...(value.fromAmount &&
          !value.fromAmount?.eq(0) &&
          value.fromAmount?.isFinite() && { amount: value.fromAmount.toFixed() })
      });
    });
  }

  public setupQueryParams(queryParams: QueryParams): void {
    if (queryParams) {
      this.setIframeStatus(queryParams);
      this.setHiddenStatus(queryParams);
      this.setTopTokens(queryParams);
      this.setBackgroundStatus(queryParams);
      this.setHideSelectionStatus(queryParams);
      this.setThemeStatus(queryParams);

      const route = this.router.url.split('?')[0].substr(1);
      const hasParams = Object.keys(queryParams).length !== 0;
      if (hasParams && route === '') {
        this.initiateTradesParams(queryParams);
      } else if (hasParams) {
        this.initiateCryptoTapParams(queryParams);
      }
    }
  }

  public setQueryParams(params: Partial<QueryParams>): void {
    this.currentQueryParams = {
      ...this.currentQueryParams,
      ...params
    };
    this.navigate();
  }

  private initiateTradesParams(params: QueryParams): void {
    this.tokensService.tokens
      .pipe(
        filter(tokens => tokens?.size !== 0),
        first(),
        mergeMap(tokens =>
          this.getProtectedSwapParams(params).pipe(
            map(protectedParams => ({ tokens, protectedParams }))
          )
        ),
        mergeMap(({ tokens, protectedParams }) => {
          const fromBlockchain = protectedParams.fromChain as BLOCKCHAIN_NAME;
          const toBlockchain = protectedParams.toChain as BLOCKCHAIN_NAME;

          const findFromToken$ = this.getTokenBySymbolOrAddress(
            tokens,
            protectedParams?.from,
            fromBlockchain
          );
          const findToToken$ = this.getTokenBySymbolOrAddress(
            tokens,
            protectedParams?.to,
            toBlockchain
          );

          return forkJoin([findFromToken$, findToToken$]).pipe(
            map(([fromToken, toToken]) => ({
              fromToken,
              toToken,
              fromBlockchain,
              toBlockchain,
              protectedParams
            }))
          );
        })
      )
      .subscribe(({ fromToken, toToken, fromBlockchain, toBlockchain, protectedParams }) => {
        this.swapFormService.commonTrade.controls.input.patchValue({
          fromBlockchain,
          toBlockchain,
          ...(fromToken && { fromToken }),
          ...(toToken && { toToken }),
          ...(protectedParams.amount !== undefined && {
            fromAmount: new BigNumber(protectedParams.amount)
          })
        });
      });
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private initiateCryptoTapParams(params: QueryParams): void {
    // TODO: add crypto tap params
  }

  private getProtectedSwapParams(queryParams: QueryParams): Observable<QueryParams> {
    return this.swapsService.bridgeTokensPairs.pipe(
      filter(pairs => !!pairs?.length),
      first(),
      map(pairs => {
        const fromChain = Object.values(BLOCKCHAIN_NAME).includes(
          queryParams?.fromChain as BLOCKCHAIN_NAME
        )
          ? queryParams.fromChain
          : QueryParamsService.DEFAULT_PARAMETERS.swap.fromChain;

        const toChain = Object.values(BLOCKCHAIN_NAME).includes(
          queryParams?.toChain as BLOCKCHAIN_NAME
        )
          ? queryParams.toChain
          : QueryParamsService.DEFAULT_PARAMETERS.swap.toChain;

        const newParams =
          queryParams.from || queryParams.to
            ? {
                ...queryParams,
                from:
                  queryParams.from || QueryParamsService.DEFAULT_PARAMETERS.swap.from[fromChain],
                to: queryParams.to || QueryParamsService.DEFAULT_PARAMETERS.swap.to[toChain],
                amount: queryParams.amount || QueryParamsService.DEFAULT_PARAMETERS.swap.amount,
                fromChain,
                toChain
              }
            : {
                ...queryParams,
                fromChain,
                toChain
              };
        if (newParams.from === newParams.to && fromChain === toChain) {
          // eslint-disable-next-line @typescript-eslint/no-unused-expressions
          newParams.from === QueryParamsService.DEFAULT_PARAMETERS.swap.from[fromChain]
            ? (newParams.from = QueryParamsService.DEFAULT_PARAMETERS.swap.to[fromChain])
            : (newParams.to = QueryParamsService.DEFAULT_PARAMETERS.swap.from[fromChain]);
        }

        if (
          fromChain !== toChain &&
          !pairs.some(
            (pair: BlockchainsBridgeTokens) =>
              pair.fromBlockchain === fromChain &&
              pair.toBlockchain === toChain &&
              pair.bridgeTokens.some(
                bridgeToken =>
                  bridgeToken.blockchainToken[fromChain]?.symbol.toLowerCase() ===
                    newParams.from.toLowerCase() &&
                  bridgeToken.blockchainToken[toChain]?.symbol.toLowerCase() ===
                    newParams.to.toLowerCase()
              )
          )
        ) {
          newParams.from = null;
          newParams.to = null;
        }
        return newParams;
      })
    );
  }

  private getTokenBySymbolOrAddress(
    tokens: List<TokenAmount>,
    token: string,
    chain: BLOCKCHAIN_NAME
  ): Observable<TokenAmount> {
    if (!token) {
      return of(null);
    }

    return this.isAddress(token, chain)
      ? this.searchTokenByAddress(tokens, token, chain)
      : of(this.searchTokenBySymbol(tokens, token, chain));
  }

  private searchTokenBySymbol(
    tokens: List<TokenAmount>,
    symbol: string,
    chain: string
  ): TokenAmount {
    const similarTokens = tokens.filter(
      token => token.symbol === symbol && token.blockchain === chain
    );

    if (!similarTokens.size) {
      return null;
    }

    return similarTokens.size > 1
      ? similarTokens.find(token => token.usedInIframe) || similarTokens.first()
      : similarTokens.first();
  }

  private searchTokenByAddress(
    tokens: List<TokenAmount>,
    address: string,
    chain: BLOCKCHAIN_NAME
  ): Observable<TokenAmount> {
    const searchingToken = tokens.find(
      token => token.address === address && token.blockchain === chain
    );

    return searchingToken
      ? of(searchingToken)
      : this.tokensService.addToken(address, chain).pipe(first());
  }

  private isAddress(token: string, chain: BLOCKCHAIN_NAME): boolean {
    const web3Public: Web3Public = this.web3Public[chain];
    return web3Public.isAddressCorrect(token);
  }

  private isHEXColor(color: string): boolean {
    return /^[A-F0-9]+$/i.test(color);
  }

  private navigate(): void {
    this.router.navigate([], {
      queryParams: this.currentQueryParams,
      queryParamsHandling: 'merge'
    });
  }

  private setIframeStatus(queryParams: QueryParams) {
    if (queryParams.iframe === 'true') {
      this._isIframe$.next(true);
      this.document.body.classList.add('iframe');
      return;
    }
    this._isIframe$.next(false);
  }

  private setHiddenStatus(queryParams: QueryParams) {
    if (queryParams.hidden) {
      this._hiddenNetworks$.next(queryParams.hidden.split(','));
    }
  }

  private setTopTokens(queryParams: QueryParams) {
    const hasTopTokens = Object.values(BLOCKCHAIN_NAME).some(
      blockchain => `topTokens[${blockchain}]` in queryParams
    );

    if (hasTopTokens) {
      const topTokens = Object.entries(queryParams).reduce(
        (
          acc: { [k in keyof Record<BLOCKCHAIN_NAME, string>]?: string[] },
          curr: [string, string]
        ) => {
          const [key, value] = curr;
          const newKey = key.substring('keyTokens'.length + 1, key.length - 1);
          return key.includes('topTokens') ? { ...acc, [newKey]: value.split(',') } : acc;
        },
        {}
      );
      this.tokensService.tokens
        .pipe(
          filter(tokens => tokens?.size !== 0),
          first()
        )
        .subscribe(tokens => {
          const rankedTokens = tokens.map((token: TokenAmount) => {
            const currentBlockchainTop = topTokens[token.blockchain];
            const isTop =
              currentBlockchainTop?.length > 0 &&
              currentBlockchainTop.some(topToken => {
                return topToken === token.symbol;
              });
            return isTop
              ? {
                  ...token,
                  rank: TOKEN_RANK.TOP
                }
              : token;
          });

          this.tokensService.setTokens(rankedTokens);
        });
    }
  }

  private setBackgroundStatus(queryParams: QueryParams) {
    if (queryParams.background) {
      const color = queryParams.background;
      this.document.body.style.background = this.isHEXColor(color) ? `#${color}` : color;
    }
  }

  private setHideSelectionStatus(queryParams: QueryParams) {
    if (queryParams.hideSelection) {
      this._tokensSelectionDisabled$.next(queryParams.hideSelection === 'true');
    }
  }

  private setThemeStatus(queryParams: QueryParams) {
    if (queryParams.theme && queryParams.theme === 'dark') {
      this._theme$.next('dark');
      this.document.body.classList.add('dark');
    }
  }
}
