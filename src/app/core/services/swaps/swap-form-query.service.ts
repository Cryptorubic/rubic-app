import { Injectable } from '@angular/core';
import { QueryParamsService } from '@core/services/query-params/query-params.service';
import { first, map, switchMap } from 'rxjs/operators';
import { BehaviorSubject, forkJoin, Observable, of, skip } from 'rxjs';
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
import { compareAddresses, switchIif } from '@shared/utils/utils';
import { TokensService } from '@core/services/tokens/tokens.service';
import { FiatsService } from '@core/services/fiats/fiats.service';
import { GoogleTagManagerService } from '@core/services/google-tag-manager/google-tag-manager.service';
import { SwapFormService } from '@core/services/swaps/swap-form.service';
import { WalletConnectorService } from '@core/services/wallets/wallet-connector-service/wallet-connector.service';
import { AssetType } from '@features/swaps/shared/models/form/asset';

@Injectable()
export class SwapFormQueryService {
  private readonly _initialLoading$ = new BehaviorSubject<boolean>(true);

  public readonly initialLoading$ = this._initialLoading$.asObservable();

  constructor(
    private readonly queryParamsService: QueryParamsService,
    private readonly swapFormService: SwapFormService,
    private readonly tokensService: TokensService,
    private readonly fiatsService: FiatsService,
    private readonly gtmService: GoogleTagManagerService,
    private readonly walletConnectorService: WalletConnectorService
  ) {
    this.subscribeOnSwapForm();

    this.subscribeOnQueryParams();
  }

  private subscribeOnSwapForm(): void {
    this.swapFormService.inputValue$.pipe(skip(2)).subscribe(value => {
      this.queryParamsService.patchQueryParams({
        ...(value.fromAsset?.symbol && { from: value.fromAsset.symbol }),
        ...(value.toToken?.symbol && { to: value.toToken.symbol }),
        ...(value.fromAssetType && { fromChain: value.fromAssetType }),
        ...(value.toBlockchain && { toChain: value.toBlockchain }),
        ...(value.fromAmount?.gt(0) && { amount: value.fromAmount.toFixed() }),
        onramperTxId: null
      });
    });
  }

  private subscribeOnQueryParams(): void {
    forkJoin([
      this.tokensService.tokens$.pipe(first(Boolean)),
      this.fiatsService.fiats$.pipe(first(Boolean))
    ])
      .pipe(
        switchMap(([tokens, fiats]) => {
          const queryParams = this.queryParamsService.queryParams;
          const protectedParams = this.getProtectedSwapParams(queryParams);

          const fromAssetType = protectedParams.fromChain;
          const toBlockchain = protectedParams.toChain;

          const findFromToken$ = BlockchainsInfo.isBlockchainName(fromAssetType)
            ? this.getTokenBySymbolOrAddress(tokens, protectedParams.from, fromAssetType)
            : of(fiats.find(fiat => fiat.symbol === protectedParams.from));
          const findToToken$ = this.getTokenBySymbolOrAddress(
            tokens,
            protectedParams.to,
            toBlockchain
          );

          return forkJoin([findFromToken$, findToToken$]).pipe(
            map(([fromToken, toToken]) => ({
              fromAsset: fromToken,
              toToken,
              fromAssetType,
              toBlockchain,
              protectedParams
            }))
          );
        })
      )
      .subscribe(({ fromAsset, toToken, fromAssetType, toBlockchain, protectedParams }) => {
        this.gtmService.needTrackFormEventsNow = false;
        this.swapFormService.inputControl.patchValue({
          fromAssetType,
          toBlockchain,
          ...(fromAsset && { fromAsset }),
          ...(toToken && { toToken }),
          ...(protectedParams.amount && { fromAmount: new BigNumber(protectedParams.amount) })
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
      toChain,
      ...(queryParams.from && { from: queryParams.from }),
      ...(queryParams.to && { to: queryParams.to }),
      ...(queryParams.amount && { amount: queryParams.amount })
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
    if (Web3Pure[chainType].isAddressCorrect(token)) {
      const address = chainType === CHAIN_TYPE.EVM ? EvmWeb3Pure.toChecksumAddress(token) : token;
      return this.searchTokenByAddress(tokens, address, chain);
    }
    return this.searchTokenBySymbol(tokens, token, chain);
  }

  private searchTokenBySymbol(
    tokens: List<TokenAmount>,
    symbol: string,
    chain: BlockchainName
  ): Observable<TokenAmount | null> {
    const similarTokens = tokens.filter(
      token =>
        token.symbol.toLocaleLowerCase() === symbol.toLocaleLowerCase() &&
        token.blockchain === chain
    );

    if (!similarTokens.size) {
      return this.tokensService.fetchQueryTokens(symbol, chain).pipe(
        map(foundTokens => {
          if (foundTokens?.size) {
            const token =
              foundTokens?.size > 1
                ? foundTokens.find(
                    el => el.symbol.toLocaleLowerCase() === symbol.toLocaleLowerCase()
                  )
                : foundTokens.first();
            if (!token) {
              return null;
            }
            const newToken = { ...token, amount: new BigNumber(NaN) };
            this.tokensService.addToken(newToken);
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
            () => this.tokensService.addTokenByAddress(address, chain).pipe(first())
          ),
          map(fetchedToken => {
            const newToken = { ...fetchedToken, amount: new BigNumber(NaN) };
            this.tokensService.addToken(newToken);
            return newToken;
          })
        );
  }
}
