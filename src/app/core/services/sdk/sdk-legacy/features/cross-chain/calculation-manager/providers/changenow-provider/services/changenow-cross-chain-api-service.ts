import { changenowApiKey } from '../../../../../common/providers/changenow/constants/changenow-api-key';
import { ChangenowStatusResponse } from '../models/changenow-api-response';

import {
  CROSS_CHAIN_DEPOSIT_STATUS,
  CrossChainDepositData
} from '../../common/cross-chain-transfer-trade/models/cross-chain-deposit-statuses';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { GetDepositStatusFnParams } from '../../common/cross-chain-transfer-trade/utils/get-deposit-status';

export class ChangeNowCrossChainApiService {
  public static changenowApiEndpoint = 'https://api.changenow.io/v2';

  public static async getTxStatus(
    changenowId: string,
    _params: GetDepositStatusFnParams,
    httpClient: HttpClient
  ): Promise<CrossChainDepositData> {
    const res = await firstValueFrom(
      httpClient.get<ChangenowStatusResponse>(
        `${ChangeNowCrossChainApiService.changenowApiEndpoint}/exchange/by-id`,
        {
          params: { id: changenowId },
          headers: { 'x-changenow-api-key': changenowApiKey }
        }
      )
    );

    if (res.status === 'refunded' || res.status === 'finished') {
      return {
        status: CROSS_CHAIN_DEPOSIT_STATUS.FINISHED,
        dstHash: res.payoutHash
      };
    }

    const depositData: CrossChainDepositData = {
      status: res.status,
      dstHash: res.payoutHash
    };

    return depositData;
  }
}
