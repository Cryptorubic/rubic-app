import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { QueryParams } from './models/query-params';

@Injectable({
  providedIn: 'root'
})
export class QueryParamsService {
  public currentQueryParams: QueryParams;

  public defaultBscParams: QueryParams;

  public defaultEthParams: QueryParams;

  constructor(private readonly route: Router) {
    this.defaultBscParams = {
      from: 'BNB',
      to: 'BRBC',
      chain: BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN,
      amount: '1'
    };
    this.defaultEthParams = {
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
    const { chain } = this.currentQueryParams;

    if (chain === BLOCKCHAIN_NAME.ETHEREUM) {
      this.currentQueryParams = {
        from: this.currentQueryParams.from || this.defaultEthParams.from,
        to: this.currentQueryParams.to || this.defaultEthParams.to,
        amount: this.currentQueryParams.amount || this.defaultEthParams.amount,
        chain: this.currentQueryParams.chain || this.defaultEthParams.chain
      };
    } else if (chain === BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN) {
      this.currentQueryParams = {
        from: this.currentQueryParams.from || this.defaultBscParams.from,
        to: this.currentQueryParams.to || this.defaultBscParams.to,
        amount: this.currentQueryParams.amount || this.defaultBscParams.amount,
        chain: this.currentQueryParams.chain || this.defaultBscParams.chain
      };
    }
    this.navigate();
  };

  public clearCurrentParams() {
    this.currentQueryParams = {
      from: null,
      to: null,
      amount: null
    };
  }

  public swapDefaultParams() {
    [this.defaultEthParams.from, this.defaultEthParams.to] = [
      this.defaultEthParams.to,
      this.defaultEthParams.from
    ];
    [this.defaultBscParams.from, this.defaultBscParams.to] = [
      this.defaultBscParams.to,
      this.defaultBscParams.from
    ];
  }
}
