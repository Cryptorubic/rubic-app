import { HttpClient } from '@angular/common/http';
import {
  CROSS_CHAIN_DEPOSIT_STATUS,
  CrossChainDepositData
} from '../../common/cross-chain-transfer-trade/models/cross-chain-deposit-statuses';
import { ChangellyExchangeStatusResponse } from '../models/changelly-exchange-status';
import { firstValueFrom } from 'rxjs';

export class ChangellyApiService {
  private static xApiKey = 'sndfje3u4b3fnNSDNFUSDNVSunw345842hrnfd3b4nt4';

  private static endpoint = 'https://x-api.rubic.exchange/changelly';

  public static async getTxStatus(
    id: string,
    httpClient: HttpClient
  ): Promise<CrossChainDepositData> {
    const { result } = await firstValueFrom(
      httpClient.post<{
        result: ChangellyExchangeStatusResponse[];
      }>(
        `${ChangellyApiService.endpoint}?method=getTransactions`,
        {
          params: {
            id
          }
        },
        {
          headers: {
            apiKey: ChangellyApiService.xApiKey
          }
        }
      )
    );

    const txData = result[0]!;

    if (txData.status === 'overdue' || txData.status === 'failed') {
      return {
        status: CROSS_CHAIN_DEPOSIT_STATUS.FAILED,
        dstHash: null
      };
    }

    if (txData.status === 'new' || txData.status === 'waiting') {
      return {
        status: CROSS_CHAIN_DEPOSIT_STATUS.WAITING,
        dstHash: null
      };
    }

    if (txData.status === 'refunded' || txData.status === 'finished') {
      return {
        status: CROSS_CHAIN_DEPOSIT_STATUS.FINISHED,
        dstHash: txData.payoutHash
      };
    }

    const depositData: CrossChainDepositData = {
      status: txData.status,
      dstHash: null
    };

    return depositData;
  }
}
