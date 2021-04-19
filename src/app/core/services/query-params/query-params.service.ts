import { AsyncPipe } from '@angular/common';
import { ChangeDetectorRef, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { List } from 'immutable';
import { Observable } from 'rxjs';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import SwapToken from 'src/app/shared/models/tokens/SwapToken';
import { TokensService } from '../backend/tokens-service/tokens.service';
import { Web3PublicService } from '../blockchain/web3-public-service/web3-public.service';
import { TradeParametersService } from '../swaps/trade-parameters-service/trade-parameters.service';
import { TradeTypeService } from '../swaps/trade-type-service/trade-type.service';
import { QueryParams } from './models/query-params';

@Injectable({
  providedIn: 'root'
})
export class QueryParamsService {
  public currentQueryParams: QueryParams;

  public defaultBSCparams: QueryParams;

  public defaultETHparams: QueryParams;

  public defaultBridgeParams: QueryParams;

  private $tokens: Observable<List<SwapToken>>;

  constructor(
    private readonly route: Router,
    private readonly tradeParametersService: TradeParametersService,
    private readonly tokensService: TokensService,
    private readonly tradeTypeService: TradeTypeService,
    private readonly web3Public: Web3PublicService
  ) {
    this.$tokens = this.tokensService.tokens.asObservable();
    this.defaultBSCparams = {
      from: 'BNB',
      to: 'BRBC',
      amount: '1'
    };
    this.defaultETHparams = {
      from: 'ETH',
      to: 'RBC',
      amount: '1'
    };
    this.defaultBridgeParams = {
      chain: 'ethSymbol'
    };
  }

  public async initiateTradesParams(params: QueryParams, cdr: ChangeDetectorRef): Promise<void> {
    const queryParams = this.setDefaultParams(params);
    this.currentQueryParams = queryParams;
    const chain =
      queryParams.chain === BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN
        ? BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN
        : BLOCKCHAIN_NAME.ETHEREUM;
    const tradeParams = {
      fromToken: (await this.getToken('from', cdr)) || undefined,
      toToken: (await this.getToken('to', cdr)) || undefined,
      fromAmount:
        queryParams.amount || this.tradeParametersService.getTradeParameters(chain).fromAmount,
      toAmount: this.tradeParametersService.getTradeParameters(chain).toAmount,
      isCustomFromTokenFormOpened: false,
      isCustomToTokenFormOpened: false,
      customFromTokenAddress:
        queryParams.from && this.isAddress(queryParams.from) ? queryParams.from : undefined,
      customToTokenAddress:
        queryParams.to && this.isAddress(queryParams.to) ? queryParams.to : undefined
    };
    this.tradeParametersService.setTradeParameters(chain, tradeParams);
    this.tradeTypeService.setBlockchain(chain);
  }

  public initiateBridgeParams(params: QueryParams): void {
    this.currentQueryParams = {
      from: this.defaultBridgeParams.from || params.from,
      amount: this.defaultBridgeParams.amount || params.amount,
      chain: this.defaultBridgeParams.chain || params.chain
    };
  }

  private async getToken(
    tokenType: 'from' | 'to',
    cdr: ChangeDetectorRef
  ): Promise<SwapToken | undefined> {
    const tokenInfo = this.currentQueryParams[tokenType];
    return !this.isAddress(tokenInfo)
      ? this.searchTokenBySymbol(tokenInfo, cdr)
      : this.searchTokenByAddress(tokenInfo, cdr);
  }

  public isAddress(token: string): boolean {
    return token.length > 10 && token.slice(0, 2) === '0x';
  }

  public setQueryParam(key: keyof QueryParams, value: any): void {
    if (this.currentQueryParams && value) {
      this.currentQueryParams[key] = value;
      this.navigate();
    }
  }

  public removeQueryParam(key: keyof QueryParams): void {
    this.currentQueryParams[key] = undefined;
    this.navigate();
  }

  public searchTokenBySymbol(
    queryParam: string,
    cdr: ChangeDetectorRef,
    tokensList?: List<any>,
    isBridge?: boolean
  ): SwapToken {
    const tokens = tokensList || new AsyncPipe(cdr).transform(this.$tokens);
    const similarTokens = tokens.filter(token =>
      isBridge
        ? token.symbol === queryParam
        : token.symbol === queryParam && token.blockchain === this.currentQueryParams.chain
    );

    return similarTokens.size > 1
      ? similarTokens.find(token => token.used_in_iframe)
      : similarTokens.first();
  }

  public async searchTokenByAddress(
    queryParam: string,
    cdr: ChangeDetectorRef,
    tokensList?: List<any>,
    isBridge?: boolean
  ): Promise<SwapToken> {
    const tokens = tokensList || new AsyncPipe(cdr).transform(this.$tokens);
    const searchingToken = tokens.find(token =>
      isBridge
        ? token.address === queryParam
        : token.address === queryParam && token.blockchain === this.currentQueryParams.chain
    );

    return searchingToken || (await this.getCustomToken(queryParam));
  }

  public async getCustomToken(address: string): Promise<SwapToken> {
    let customToken = null;
    try {
      customToken = await this.web3Public[this.currentQueryParams.chain].getTokenInfo(address);
      customToken = {
        blockchain: undefined,
        image: undefined,
        rank: undefined,
        price: undefined,
        used_in_iframe: undefined,
        ...customToken
      };
    } catch (e) {
      console.error(e);
    }
    return customToken;
  }

  private navigate(): void {
    this.route.navigate([], {
      queryParams: this.currentQueryParams,
      queryParamsHandling: 'merge'
    });
  }

  private setDefaultParams(queryParams: QueryParams): QueryParams {
    const chain =
      queryParams.chain !== BLOCKCHAIN_NAME.MATIC ? queryParams.chain : BLOCKCHAIN_NAME.ETHEREUM;
    let newQueryParams: QueryParams;

    if (queryParams.from || queryParams.to) {
      if (chain === BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN) {
        newQueryParams = {
          ...queryParams,
          from: queryParams.from || this.defaultBSCparams.from,
          to: queryParams.to || this.defaultBSCparams.to,
          amount: queryParams.amount || this.defaultBSCparams.amount
        };
      } else {
        newQueryParams = {
          ...queryParams,
          from: queryParams.from || this.defaultETHparams.from,
          to: queryParams.to || this.defaultETHparams.to,
          amount: queryParams.amount || this.defaultETHparams.amount
        };
      }
    }
    return newQueryParams;
  }

  public clearCurrentParams() {
    this.currentQueryParams = {
      from: null,
      to: null,
      amount: null,
      chain: null
    };
    this.navigate();
  }

  public swapDefaultParams() {
    [this.defaultETHparams.from, this.defaultETHparams.to] = [
      this.defaultETHparams.to,
      this.defaultETHparams.from
    ];
    [this.defaultBSCparams.from, this.defaultBSCparams.to] = [
      this.defaultBSCparams.to,
      this.defaultBSCparams.from
    ];
  }
}
