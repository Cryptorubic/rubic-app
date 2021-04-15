import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { QueryParams } from './models/query-params';

@Injectable({
  providedIn: 'root'
})
export class QueryParamsService {
  public currentQueryParams: QueryParams;

  public defaultBSCparams: QueryParams;

  public defaultETHparams: QueryParams;

  constructor(private readonly route: Router) {
    this.defaultBSCparams = {
      from: 'BNB',
      to: 'BRBC',
      chain: BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN,
      amount: '1'
    };
    this.defaultETHparams = {
      from: 'ETH',
      to: 'RBC',
      chain: BLOCKCHAIN_NAME.ETHEREUM,
      amount: '1'
    };
  }

  public setupParams(queryParams: QueryParams): void {
    this.currentQueryParams = {
      from: queryParams.from,
      to: queryParams.to,
      chain: queryParams.chain,
      amount: queryParams.amount
    };
  }

  public setQueryParam(key: keyof QueryParams, value: any): void {
    this.currentQueryParams[key] = value;
    this.navigate();
  }

  private navigate(): void {
    this.route.navigate([], {
      queryParams: this.currentQueryParams,
      queryParamsHandling: 'merge'
    });
  }

  public isAddressQuery(paramName: string): boolean {
    return paramName.length > 10 && paramName.slice(0, 2) === '0x';
  }

  public setDefaultParams = () => {
    const chain = this.currentQueryParams.chain;

    if (chain === BLOCKCHAIN_NAME.ETHEREUM) {
      this.currentQueryParams = {
        from: this.currentQueryParams.from || this.defaultETHparams.from,
        to: this.currentQueryParams.to || this.defaultETHparams.to,
        amount: this.currentQueryParams.amount || this.defaultETHparams.amount,
        chain: this.currentQueryParams.chain || this.defaultETHparams.chain
      };
    } else if (chain === BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN) {
      this.currentQueryParams = {
        from: this.currentQueryParams.from || this.defaultBSCparams.from,
        to: this.currentQueryParams.to || this.defaultBSCparams.to,
        amount: this.currentQueryParams.amount || this.defaultBSCparams.amount,
        chain: this.currentQueryParams.chain || this.defaultBSCparams.chain
      };
    }
  };

  public clearCurrentParams() {
    this.currentQueryParams = {
      from: null,
      to: null,
      amount: null
    };
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
