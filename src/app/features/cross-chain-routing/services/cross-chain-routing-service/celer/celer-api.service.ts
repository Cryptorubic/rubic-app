import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { EstimateAmtResponse } from './models/estimate-amt-response.interface';
import { HttpService } from '@core/services/http/http.service';
import { SupportedCrossChainBlockchain } from '@features/cross-chain-routing/services/cross-chain-routing-service/models/supported-cross-chain-blockchain';

@Injectable()
export class CelerApiService {
  private readonly celerApiBaseUrl = 'https://cbridge-prod2.celer.network/';

  constructor(private readonly httpService: HttpService) {}

  public getEstimateAmt(
    src_chain_id: number,
    dst_chain_id: number,
    token_symbol: string,
    slippage_tolerance: number,
    amt: string,
    usr_addr?: string,
    is_pegged?: boolean
  ): Observable<EstimateAmtResponse> {
    let params = new HttpParams()
      .append('src_chain_id', src_chain_id)
      .append('dst_chain_id', dst_chain_id)
      .append('token_symbol', token_symbol)
      .append('slippage_tolerance', slippage_tolerance)
      .append('amt', amt);

    if (usr_addr) {
      params = params.append('usr_addr', usr_addr);
    }

    if (is_pegged) {
      params = params.append('is_pegged', is_pegged);
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
