import { Injectable } from '@angular/core';
import { QueryParamsService } from '@core/services/query-params/query-params.service';
import { catchError, distinctUntilChanged, first, map, pairwise, switchMap } from 'rxjs/operators';
import { BehaviorSubject, forkJoin, from, Observable, of, skip } from 'rxjs';
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
import { FiatsService } from '@core/services/fiats/fiats.service';
import { GoogleTagManagerService } from '@core/services/google-tag-manager/google-tag-manager.service';
import { SwapFormService } from '@core/services/swaps/swap-form.service';
import { WalletConnectorService } from '@core/services/wallets/wallet-connector-service/wallet-connector.service';
import { AssetType } from '@features/swaps/shared/models/form/asset';
import { SwapTypeService } from '@core/services/swaps/swap-type.service';
import { SWAP_PROVIDER_TYPE } from '@features/swaps/features/swap-form/models/swap-provider-type';
import { TokensStoreService } from '@core/services/tokens/tokens-store.service';
import { TokensService } from '@core/services/tokens/tokens.service';
import { AvailableTokenAmount } from '@shared/models/tokens/available-token-amount';

@Injectable()
export class SwapFormQueryService {
  private readonly _initialLoading$ = new BehaviorSubject<boolean>(true);

  public readonly initialLoading$ = this._initialLoading$.asObservable();

  public get initialLoading(): boolean {
    return this._initialLoading$.getValue();
  }

  constructor(
    private readonly queryParamsService: QueryParamsService,
    private readonly swapFormService: SwapFormService,
    private readonly swapTypeService: SwapTypeService,
    private readonly tokensService: TokensService,
    private readonly tokensStoreService: TokensStoreService,
    private readonly fiatsService: FiatsService,
    private readonly gtmService: GoogleTagManagerService,
    private readonly walletConnectorService: WalletConnectorService
  ) {
    this.subscribeOnSwapForm();
    this.subscribeOnSwapType();

    this.subscribeOnQueryParams();
  }

  private subscribeOnSwapForm(): void {
    this.swapFormService.inputValue$
      .pipe(
        skip(1),
        distinctUntilChanged((prev, curr) => compareObjects(prev, curr)),
        pairwise()
      )
      .subscribe(([prev, curr]) => {
        let isEqual = compareObjects(prev, curr);
        if (
          prev?.fromAsset &&
          'price' in prev?.fromAsset &&
          curr?.fromAsset &&
          'price' in curr?.fromAsset
        ) {
          const pricelessPrev = {
            ...prev,
            fromAsset: {
              ...(prev.fromAsset as AvailableTokenAmount),
              price: 0
            },
            toToken: {
              ...prev.toToken,
              price: 0
            }
          };

          const pricelessCurr = {
            ...curr,
            fromAsset: {
              ...(curr.fromAsset as AvailableTokenAmount),
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
          ...(curr.fromAsset?.symbol && { from: curr.fromAsset.symbol }),
          ...(curr.toToken?.symbol && { to: curr.toToken.symbol }),
          ...(curr.fromAssetType && { fromChain: curr.fromAssetType }),
          ...(curr.toBlockchain && { toChain: curr.toBlockchain }),
          ...(curr.fromAmount?.gt(0) && { amount: curr.fromAmount.toFixed() }),
          ...(!isEqual && { onramperTxId: null })
        });
      });

    this.swapFormService.outputValue$.pipe(skip(1)).subscribe(value => {
      if (
        this.swapTypeService.getSwapProviderType() === SWAP_PROVIDER_TYPE.LIMIT_ORDER &&
        value.toAmount?.gt(0)
      ) {
        this.queryParamsService.patchQueryParams({
          amountTo: value.toAmount.toFixed()
        });
      }
    });
  }

  private subscribeOnSwapType(): void {
    this.swapTypeService.swapMode$.pipe(distinctUntilChanged()).subscribe(mode => {
      if (!this._initialLoading$.getValue() && mode === SWAP_PROVIDER_TYPE.LIMIT_ORDER) {
        const amountTo = this.queryParamsService.queryParams.amountTo;
        const { toAmount } = this.swapFormService.outputValue;
        if (!toAmount?.eq(amountTo)) {
          this.swapFormService.outputControl.patchValue({
            ...(amountTo && { toAmount: new BigNumber(amountTo) })
          });
        }
      }
    });
  }

  private subscribeOnQueryParams(): void {
    forkJoin([
      this.tokensStoreService.tokens$.pipe(first(Boolean)),
      this.fiatsService.fiats$.pipe(first(Boolean))
    ])
      .pipe(
        switchMap(([tokens, fiats]) => {
          const queryParams = this.queryParamsService.queryParams;
          const protectedParams = this.getProtectedSwapParams(queryParams);

          const fromAssetType = protectedParams.fromChain;
          const toBlockchain = protectedParams.toChain;

          const findFromAsset$ = BlockchainsInfo.isBlockchainName(fromAssetType)
            ? this.getTokenBySymbolOrAddress(tokens, protectedParams.from, fromAssetType)
            : of(fiats.find(fiat => fiat.symbol === protectedParams.from));
          const findToToken$ = this.getTokenBySymbolOrAddress(
            tokens,
            protectedParams.to,
            toBlockchain
          );

          return forkJoin([findFromAsset$, findToToken$]).pipe(
            map(([fromAsset, toToken]) => ({
              fromAsset,
              toToken,
              fromAssetType,
              toBlockchain,
              amount: protectedParams.amount,
              amountTo: protectedParams.amountTo
            }))
          );
        })
      )
      .subscribe(({ fromAsset, toToken, fromAssetType, toBlockchain, amount, amountTo }) => {
        this.gtmService.needTrackFormEventsNow = false;

        this.swapFormService.inputControl.patchValue({
          fromAssetType,
          toBlockchain,
          ...(fromAsset && { fromAsset }),
          ...(toToken && { toToken }),
          ...(amount && { fromAmount: new BigNumber(amount) })
        });
        if (this.swapTypeService.getSwapProviderType() === SWAP_PROVIDER_TYPE.LIMIT_ORDER) {
          this.swapFormService.outputControl.patchValue({
            ...(amountTo && { toAmount: new BigNumber(amountTo) })
          });
        }

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

    const chainType: CHAIN_TYPE = BlockchainsInfo.getChainType(chain);

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
      })
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
