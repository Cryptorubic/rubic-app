import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { EstimateAmtResponse } from './models/estimate-amt-response.interface';
import { HttpService } from '@core/services/http/http.service';
import { SupportedCrossChainBlockchain } from '@features/swaps/features/cross-chain-routing/services/cross-chain-routing-service/models/supported-cross-chain-blockchain';
import { LiquidityInfoResponse } from './models/liquidity-info-response.interface';

@Injectable()
export class CelerApiService {
  private readonly celerApiBaseUrl = 'https://cbridge-prod2.celer.network/';

  constructor(private readonly httpService: HttpService) {}

  public getCelerLiquidityInfo(): Observable<LiquidityInfoResponse> {
    return this.httpService.get<LiquidityInfoResponse>(
      'v1/getLPInfoList',
      {},
      this.celerApiBaseUrl
    );
    // .pipe(
    //   switchMap(response => {
    //     if (response.err) {
    //       throw new Error(response.err);
    //     } else {
    //       return of(response.lp_info);
    //     }
    //   })
    // );
  }

  public getEstimateAmt(
    src_chain_id: number,
    dst_chain_id: number,
    token_symbol: string,
    slippage_tolerance: number,
    amt: string,
    usr_addr?: string,
    is_pegged?: boolean
  ): Observable<EstimateAmtResponse> {
    const params = new HttpParams().appendAll({
      src_chain_id,
      dst_chain_id,
      token_symbol,
      slippage_tolerance,
      amt
    });

    if (usr_addr) {
      params.append('usr_addr', usr_addr);
    }

    if (is_pegged) {
      params.append('is_pegged', is_pegged);
    }

    return this.httpService.get<EstimateAmtResponse>(
      'v2/estimateAmt',
      params,
      this.celerApiBaseUrl
    );
  }

  /**
   * Posts celer cross-chain trade information to rubic backend.
   * @param network Source swap network.
   * @param provider Hardcode: 'celer'
   * @param fromTxnHash Source swap transaction hash.
   */
  public postTradeInfo(
    network: SupportedCrossChainBlockchain,
    provider: 'celer',
    fromTxnHash: string
  ): void {
    this.httpService.post<void>('celer/trades', { network, provider, fromTxnHash }).subscribe();
  }
}
