import { Injectable } from '@angular/core';
import { QueryParamsService } from '@core/services/query-params/query-params.service';
import { catchError, distinctUntilChanged, first, map, pairwise, switchMap } from 'rxjs/operators';
import { BehaviorSubject, forkJoin, from, Observable, of } from 'rxjs';
import { BlockchainName, BlockchainsInfo, CHAIN_TYPE, EvmWeb3Pure, Web3Pure } from 'rubic-sdk';
import BigNumber from 'bignumber.js';
import { QueryParams } from '@core/services/query-params/models/query-params';
import {
  defaultFormParameters,
  DefaultParametersFrom,
  DefaultParametersTo
} from '@core/services/swaps/constants/default-form-parameters';
import { List } from 'immutable';
import { TokenAmount } from '@shared/models/tokens/token-amount';
import { compareAddresses, compareObjects, switchIif } from '@shared/utils/utils';
import { GoogleTagManagerService } from '@core/services/google-tag-manager/google-tag-manager.service';
import { WalletConnectorService } from '@core/services/wallets/wallet-connector-service/wallet-connector.service';
import { TokensStoreService } from '@core/services/tokens/tokens-store.service';
import { TokensService } from '@core/services/tokens/tokens.service';
import { AvailableTokenAmount } from '@shared/models/tokens/available-token-amount';
import { SwapsFormService } from '@features/trade/services/swaps-form/swaps-form.service';
import { AssetType } from '@features/trade/models/asset';

@Injectable()
export class SwapFormQueryService {
  private readonly _initialLoading$ = new BehaviorSubject<boolean>(true);

  public readonly initialLoading$ = this._initialLoading$.asObservable();

  public get initialLoading(): boolean {
    return this._initialLoading$.getValue();
  }

  constructor(
    private readonly queryParamsService: QueryParamsService,
    private readonly swapsFormService: SwapsFormService,
    private readonly tokensService: TokensService,
    private readonly tokensStoreService: TokensStoreService,
    private readonly gtmService: GoogleTagManagerService,
    private readonly walletConnectorService: WalletConnectorService
  ) {
    this.subscribeOnSwapForm();
    this.subscribeOnQueryParams();
  }

  private subscribeOnSwapForm(): void {
    this.swapsFormService.inputValue$
      .pipe(
        distinctUntilChanged((prev, curr) => compareObjects(prev, curr)),
        pairwise()
      )
      .subscribe(([prev, curr]) => {
        let isEqual = compareObjects(prev, curr);
        if (
          prev?.fromToken &&
          'price' in prev?.fromToken &&
          curr?.fromToken &&
          'price' in curr?.fromToken
        ) {
          const pricelessPrev = {
            ...prev,
            fromToken: {
              ...(prev.fromToken as AvailableTokenAmount),
              price: 0
            },
            toToken: {
              ...prev.toToken,
              price: 0
            }
          };

          const pricelessCurr = {
            ...curr,
            fromToken: {
              ...(curr.fromToken as AvailableTokenAmount),
              price: 0
            },
            toToken: {
              ...curr.toToken,
              price: 0
            }
          };

          isEqual = compareObjects(pricelessPrev, pricelessCurr);
        }

        this.queryParamsService.patchQueryParams({
          ...(curr.fromToken?.symbol && { from: curr.fromToken.symbol }),
          ...(curr.toToken?.symbol && { to: curr.toToken.symbol }),
          ...(curr.fromBlockchain && { fromChain: curr.fromBlockchain }),
          ...(curr.toBlockchain && { toChain: curr.toBlockchain }),
          ...(curr.fromAmount?.actualValue.gt(0) && {
            amount: curr.fromAmount.actualValue.toFixed()
          }),
          ...(!isEqual && { onramperTxId: null })
        });
      });
  }

  private subscribeOnQueryParams(): void {
    this.tokensStoreService.tokens$
      .pipe(first(Boolean))
      .pipe(
        switchMap(tokens => {
          const queryParams = this.queryParamsService.queryParams;
          const protectedParams = this.getProtectedSwapParams(queryParams);

          const fromBlockchain = protectedParams.fromChain as BlockchainName;
          const toBlockchain = protectedParams.toChain;

          const findFromToken$ = this.getTokenBySymbolOrAddress(
            tokens,
            protectedParams.from,
            fromBlockchain
          );
          const findToToken$ = this.getTokenBySymbolOrAddress(
            tokens,
            protectedParams.to,
            toBlockchain
          );

          return forkJoin([findFromToken$, findToToken$]).pipe(
            map(([fromToken, toToken]) => ({
              fromToken,
              toToken,
              fromBlockchain,
              toBlockchain,
              amount: protectedParams.amount,
              amountTo: protectedParams.amountTo
            }))
          );
        })
      )
      .subscribe(({ fromBlockchain, toToken, fromToken, toBlockchain, amount }) => {
        this.gtmService.needTrackFormEventsNow = false;

        this.swapsFormService.inputControl.patchValue({
          fromBlockchain,
          toBlockchain,
          ...(fromToken && { fromToken }),
          ...(toToken && { toToken }),
          ...(amount && {
            fromAmount: {
              actualValue: new BigNumber(amount),
              visibleValue: amount
            }
          })
        });

        this._initialLoading$.next(false);
      });
  }

  private getProtectedSwapParams(queryParams: QueryParams): QueryParams {
    let fromChain: AssetType;
    if (
      BlockchainsInfo.isBlockchainName(queryParams.fromChain) ||
      queryParams.fromChain === 'fiat'
    ) {
      fromChain = queryParams.fromChain;
    } else if (this.walletConnectorService.network) {
      fromChain = this.walletConnectorService.network;
    } else {
      fromChain = defaultFormParameters.swap.fromChain;
    }

    const toChain = BlockchainsInfo.isBlockchainName(queryParams?.toChain)
      ? queryParams.toChain
      : defaultFormParameters.swap.toChain;

    const newParams = {
      ...queryParams,
      fromChain,
      toChain
    };

    if (fromChain === toChain && newParams.from && newParams.from === newParams.to) {
      if (newParams.from === defaultFormParameters.swap.from[fromChain as DefaultParametersFrom]) {
        newParams.from = defaultFormParameters.swap.to[fromChain as DefaultParametersTo];
      } else {
        newParams.to = defaultFormParameters.swap.from[fromChain as DefaultParametersFrom];
      }
    }

    return newParams;
  }

  private getTokenBySymbolOrAddress(
    tokens: List<TokenAmount>,
    token: string,
    chain: BlockchainName
  ): Observable<TokenAmount> {
    if (!token) {
      return of(null);
    }

    const chainType = BlockchainsInfo.getChainType(chain);

    // @TODO refactoring.
    return from(Web3Pure[chainType].isAddressCorrect(token)).pipe(
      switchMap(isAddressCorrect => {
        if (chainType && isAddressCorrect) {
          const address =
            chainType === CHAIN_TYPE.EVM ? EvmWeb3Pure.toChecksumAddress(token) : token;
          return this.searchTokenByAddress(tokens, address, chain);
        }

        return this.searchTokenBySymbol(tokens, token, chain);
      }),
      catchError(() => {
        return this.searchTokenBySymbol(tokens, token, chain);
      }),
      switchMap(foundToken =>
        forkJoin(
          of(foundToken),
          from(this.tokensService.getAndUpdateTokenBalance(foundToken)).pipe(
            catchError(() => of(new BigNumber(NaN)))
          )
        )
      ),
      map(([foundToken, balance]) => ({
        ...foundToken,
        amount: balance
      }))
    );
  }

  private searchTokenBySymbol(
    tokens: List<TokenAmount>,
    symbol: string,
    chain: BlockchainName
  ): Observable<TokenAmount | null> {
    const similarTokens = tokens.filter(
      token => token.symbol.toLowerCase() === symbol.toLowerCase() && token.blockchain === chain
    );

    if (!similarTokens.size) {
      return this.tokensService.fetchQueryTokens(symbol, chain).pipe(
        map(foundTokens => {
          if (foundTokens?.size) {
            const token =
              foundTokens?.size > 1
                ? foundTokens.find(el => el.symbol.toLowerCase() === symbol.toLowerCase())
                : foundTokens.first();
            if (!token) {
              return null;
            }
            const newToken = { ...token, amount: new BigNumber(NaN) };
            this.tokensStoreService.addToken(newToken);
            return newToken;
          }
          return null;
        })
      );
    }

    return of(similarTokens.first());
  }

  private searchTokenByAddress(
    tokens: List<TokenAmount>,
    address: string,
    chain: BlockchainName
  ): Observable<TokenAmount> {
    const searchingToken = tokens.find(
      token => compareAddresses(token.address, address) && token.blockchain === chain
    );

    return searchingToken
      ? of(searchingToken)
      : this.tokensService.fetchQueryTokens(address, chain).pipe(
          switchIif(
            backendTokens => Boolean(backendTokens?.size),
            backendTokens => of(backendTokens.first()),
            () => this.tokensStoreService.addTokenByAddress(address, chain).pipe(first())
          ),
          map(fetchedToken => {
            const newToken = { ...fetchedToken, amount: new BigNumber(NaN) };
            this.tokensStoreService.addToken(newToken);
            return newToken;
          })
        );
  }
}
