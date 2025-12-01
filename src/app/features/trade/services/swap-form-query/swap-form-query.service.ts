import { Injectable } from '@angular/core';
import { QueryParamsService } from '@core/services/query-params/query-params.service';
import { catchError, distinctUntilChanged, first, map, switchMap } from 'rxjs/operators';
import { BehaviorSubject, forkJoin, from, Observable, of } from 'rxjs';
import { BlockchainName, BlockchainsInfo, CHAIN_TYPE } from '@cryptorubic/core';
import BigNumber from 'bignumber.js';
import { QueryParams } from '@core/services/query-params/models/query-params';
import { List } from 'immutable';
import { BalanceToken } from '@shared/models/tokens/balance-token';
import { compareAddresses, compareObjects, switchIif } from '@shared/utils/utils';
import { GoogleTagManagerService } from '@core/services/google-tag-manager/google-tag-manager.service';
import { WalletConnectorService } from '@core/services/wallets/wallet-connector-service/wallet-connector.service';
import { SwapsFormService } from '@features/trade/services/swaps-form/swaps-form.service';
import { defaultFormParameters } from '@features/trade/services/swap-form-query/constants/default-tokens-params';
import { tuiIsPresent } from '@taiga-ui/cdk';
import { EvmAdapter, Web3Pure } from '@cryptorubic/web3';
import { TokensFacadeService } from '@core/services/tokens/tokens-facade.service';
import { AssetListType } from '@features/trade/models/asset';

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
    private readonly gtmService: GoogleTagManagerService,
    private readonly walletConnectorService: WalletConnectorService,
    private readonly tokensFacade: TokensFacadeService
  ) {
    this.subscribeOnSwapForm();
    this.subscribeOnQueryParams();
  }

  private subscribeOnSwapForm(): void {
    this.swapsFormService.inputValue$
      .pipe(distinctUntilChanged((prev, curr) => compareObjects(prev, curr)))
      .subscribe(inputValue => {
        this.queryParamsService.patchQueryParams({
          ...(inputValue.fromToken?.symbol && { from: inputValue.fromToken.symbol }),
          ...(inputValue.toToken?.symbol && { to: inputValue.toToken.symbol }),
          ...(inputValue.fromBlockchain && { fromChain: inputValue.fromBlockchain }),
          ...(inputValue.toBlockchain && { toChain: inputValue.toBlockchain }),
          ...(inputValue.fromAmount?.actualValue.gt(0) && {
            amount: inputValue.fromAmount.actualValue.toFixed()
          })
        });
      });
  }

  private subscribeOnQueryParams(): void {
    this.tokensFacade.tokens$
      .pipe(first(tuiIsPresent))
      .pipe(
        switchMap(tokens => {
          const queryParams = this.queryParamsService.queryParams;
          const protectedParams = this.getProtectedSwapParams(queryParams);

          const fromBlockchain = protectedParams.fromChain as BlockchainName;
          const toBlockchain = protectedParams.toChain;

          const findFromToken$ = this.getTokenBySymbolOrAddress(
            List(tokens),
            protectedParams.from,
            fromBlockchain
          );
          const findToToken$ = this.getTokenBySymbolOrAddress(
            List(tokens),
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
    let fromChain: AssetListType;
    if (BlockchainsInfo.isBlockchainName(queryParams.fromChain)) {
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

    // if (fromChain === toChain && newParams.from && newParams.from === newParams.to) {
    //   if (newParams.from === defaultFormParameters.swap.from[fromChain as DefaultParametersFrom]) {
    //     newParams.from = defaultFormParameters.swap.to[fromChain as DefaultParametersTo];
    //   } else {
    //     newParams.to = defaultFormParameters.swap.from[fromChain as DefaultParametersFrom];
    //   }
    // }

    return newParams;
  }

  private getTokenBySymbolOrAddress(
    tokens: List<BalanceToken>,
    token: string,
    chain: BlockchainName
  ): Observable<BalanceToken> {
    if (!token) {
      return of(null);
    }

    const chainType = BlockchainsInfo.getChainType(chain);

    // @TODO refactoring.
    return from(Web3Pure.isAddressCorrect(chain, token)).pipe(
      switchMap(isAddressCorrect => {
        if (chainType && isAddressCorrect) {
          const address =
            chainType === CHAIN_TYPE.EVM ? EvmAdapter.toChecksumAddress(token) : token;
          return this.searchTokenByAddress(tokens, address, chain);
        }

        return this.searchTokenBySymbol(tokens, token, chain);
      }),
      catchError(() => {
        return this.searchTokenBySymbol(tokens, token, chain);
      }),
      switchMap(foundToken =>
        forkJoin([
          of(foundToken),
          from(this.tokensFacade.getAndUpdateTokenBalance(foundToken)).pipe(
            catchError(() => of(new BigNumber(NaN)))
          )
        ])
      ),
      map(([foundToken, balance]) => ({
        ...foundToken,
        amount: balance
      }))
    );
  }

  private searchTokenBySymbol(
    tokens: List<BalanceToken>,
    symbol: string,
    chain: BlockchainName
  ): Observable<BalanceToken | null> {
    const similarTokens = tokens.filter(
      token => token.symbol.toLowerCase() === symbol.toLowerCase() && token.blockchain === chain
    );

    if (!similarTokens.size) {
      return this.tokensFacade.fetchQueryTokens(symbol, chain).pipe(
        map(foundTokens => {
          if (foundTokens?.length) {
            const token =
              foundTokens?.length > 1
                ? foundTokens.find(el => el.symbol.toLowerCase() === symbol.toLowerCase())
                : foundTokens?.[0];
            if (!token) {
              return null;
            }
            const newToken = { ...token, amount: new BigNumber(NaN) } as BalanceToken;
            this.tokensFacade.addToken(newToken);
            return newToken;
          }
          return null;
        })
      );
    }

    return of(similarTokens.first());
  }

  private searchTokenByAddress(
    tokens: List<BalanceToken>,
    address: string,
    chain: BlockchainName
  ): Observable<BalanceToken> {
    const searchingToken = tokens.find(
      token => compareAddresses(token.address, address) && token.blockchain === chain
    );

    return searchingToken
      ? of(searchingToken)
      : this.tokensFacade.fetchQueryTokens(address, chain).pipe(
          switchIif(
            backendTokens => Boolean(backendTokens?.length),
            backendTokens => of(backendTokens?.[0]),
            () => this.tokensFacade.addTokenByAddress(address, chain).pipe(first())
          ),
          map(fetchedToken => {
            const newToken = {
              ...fetchedToken,
              amount: new BigNumber(NaN)
            } as unknown as BalanceToken;
            this.tokensFacade.addToken(newToken);
            return newToken;
          })
        );
  }
}
