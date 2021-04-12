import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { TRADE_MODE } from 'src/app/features/swaps-page/trades-module/models';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { QueryParams } from './models/query-params';

@Injectable({
  providedIn: 'root'
})
export class QueryParamsService {
  public currentQueryParams: QueryParams;

  private readonly defaultBSCparams: QueryParams;

  private readonly defaultETHparams: QueryParams;

  constructor(private readonly route: Router) {
    this.defaultBSCparams = {
      from: 'BNB',
      to: 'BRBC',
      chain: BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN,
      mode: TRADE_MODE.INSTANT_TRADE,
      amount: '1'
    };
    this.defaultETHparams = {
      from: 'ETH',
      to: 'RBC',
      chain: BLOCKCHAIN_NAME.ETHEREUM,
      mode: TRADE_MODE.INSTANT_TRADE,
      amount: '1'
    };
  }

  public setupParams(queryParams: QueryParams): void {
    if (queryParams.from || queryParams.to) {
      if (queryParams.chain === BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN) {
        this.currentQueryParams = {
          from: queryParams.from || this.defaultBSCparams.from,
          to: queryParams.to || this.defaultBSCparams.to,
          amount: queryParams.amount || this.defaultBSCparams.amount,
          chain: queryParams.chain || this.defaultBSCparams.chain,
          mode: queryParams.mode || this.defaultBSCparams.mode,
        };
      } else if (queryParams.chain === undefined || queryParams.chain === BLOCKCHAIN_NAME.ETHEREUM) {
        this.currentQueryParams = {
          from: queryParams.from || this.defaultETHparams.from,
          to: queryParams.to || this.defaultETHparams.to,
          amount: queryParams.amount || this.defaultETHparams.amount,
          chain: queryParams.chain || this.defaultETHparams.chain,
          mode: queryParams.mode || this.defaultETHparams.mode,
        };
      }
    }
  }

  public setQueryParam(key: keyof QueryParams, value: any): void {
    this.currentQueryParams[key] = value;
  }

  public navigate(): void {
    this.route.navigate([], {
      queryParams: this.currentQueryParams,
      queryParamsHandling: 'merge'
    })
  }

  public isAddressQuery(paramName: string): boolean {
    return paramName.length > 10 && paramName.slice(0, 2) === '0x';
  }
}
