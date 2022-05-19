import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable, tap } from 'rxjs';
import { EstimateAmtResponse } from './models/estimate-amt-response.interface';
import { HttpService } from '@core/services/http/http.service';
import { SupportedCrossChainBlockchain } from '@features/swaps/features/cross-chain-routing/services/cross-chain-routing-service/models/supported-cross-chain-blockchain';
import {
  LiquidityInfoItem,
  LiquidityInfoResponse
} from './models/liquidity-info-response.interface';
import { CELER_SUPPORTED_BLOCKCHAINS } from './constants/CELER_SUPPORTED_BLOCKCHAINS';
import networks from '@app/shared/constants/blockchain/networks';
import { BlockchainName } from '@app/shared/models/blockchain/blockchain-name';

@Injectable()
export class CelerApiService {
  private readonly celerApiBaseUrl = 'https://cbridge-prod2.celer.network/';

  constructor(private readonly httpService: HttpService) {}

  public getCelerLiquidityInfo(): Observable<Record<BlockchainName, LiquidityInfoItem[]>> {
    return this.httpService
      .get<LiquidityInfoResponse>('v1/getLPInfoList', {}, this.celerApiBaseUrl)
      .pipe(
        map(response => {
          const lpInfo = response.lp_info;

          return CELER_SUPPORTED_BLOCKCHAINS.map(blockchain => {
            const blockchainId = networks.find(item => item.name === blockchain).id;
            const tokens = lpInfo.filter(item => item.chain.id === blockchainId);

            return { [blockchain]: tokens };
          }).reduce((acc, curr) => {
            return { ...acc, ...curr };
          }, {});
        }),
        tap(console.log)
      );
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
