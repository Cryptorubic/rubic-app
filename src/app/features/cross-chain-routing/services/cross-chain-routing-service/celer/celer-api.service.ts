import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { EstimateAmtResponse } from './models/estimate-amt-response.interface';

@Injectable()
export class CelerApiService {
  private readonly celerApiBaseUrl = 'https://cbridge-v2-test.celer.network';

  constructor(private readonly httpClient: HttpClient) {}

  public getEstimateAmt(
    src_chain_id: number,
    dst_chain_id: number,
    token_symbol: string,
    slippage_tolerance: number,
    amt: string,
    usr_addr?: string,
    is_pegged?: boolean
  ): Observable<EstimateAmtResponse> {
    const params = new HttpParams()
      .append('src_chain_id', src_chain_id)
      .append('dst_chain_id', dst_chain_id)
      .append('token_symbol', token_symbol)
      .append('slippage_tolerance', slippage_tolerance)
      .append('amt', amt);

    if (usr_addr) {
      params.append('usr_addr', usr_addr);
    }

    if (is_pegged) {
      params.append('is_pegged', is_pegged);
    }

    return this.httpClient.get<EstimateAmtResponse>(`${this.celerApiBaseUrl}/v2/estimateAmt`, {
      params
    });
  }
}
