import { HttpClient } from '@angular/common/http';
import {
  CROSS_CHAIN_DEPOSIT_STATUS,
  CrossChainDepositData
} from '../../common/cross-chain-transfer-trade/models/cross-chain-deposit-statuses';
import { SimpleSwapExchange } from '../models/simple-swap-requests';
import { firstValueFrom } from 'rxjs';
import { GetDepositStatusFnParams } from '../../common/cross-chain-transfer-trade/utils/get-deposit-status';

export class SimpleSwapApiService {
  private static readonly xApiKey = 'sndfje3u4b3fnNSDNFUSDNVSunw345842hrnfd3b4nt4';

  private static readonly apiEndpoint = 'https://x-api.rubic.exchange/simpleswap/v3';

  public static async getTxStatus(
    id: string,
    params: GetDepositStatusFnParams,
    httpClient: HttpClient
  ): Promise<CrossChainDepositData> {
    const res = await firstValueFrom(
      httpClient.get<SimpleSwapExchange>(`${SimpleSwapApiService.apiEndpoint}/exchanges/${id}`, {
        headers: {
          apikey: SimpleSwapApiService.xApiKey
        }
      })
    );

    const txData = res.result;

    if (txData.status === 'refunded' || txData.status === 'finished') {
      return {
        status: CROSS_CHAIN_DEPOSIT_STATUS.FINISHED,
        dstHash: txData.txTo
      };
    }

    const depositData: CrossChainDepositData = {
      status: txData.status,
      dstHash: null
    };

    return depositData;
  }
}
