import { toBridgersBlockchain } from '../../providers/bridgers/constants/to-bridgers-blockchain';
import {
  BridgersGetTransDataByIdRequest,
  BridgersGetTransDataByIdResponse
} from '../../providers/bridgers/models/bridgers-get-trans-data-by-id-api';
import {
  BridgersUpdateDataAndStatusRequest,
  BridgersUpdateDataAndStatusResponse
} from '../../providers/bridgers/models/bridgers-update-data-and-status-api';
import { TxStatusData } from '../models/tx-status-data';
import { TX_STATUS } from '@cryptorubic/web3';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { BlockchainName } from '@cryptorubic/core';

export async function getBridgersTradeStatus(
  srcTxHash: string,
  fromBlockchain: BlockchainName,
  sourceFlag: 'rubic' | 'rubic_widget',
  httpClient: HttpClient,
  slippage?: number
): Promise<TxStatusData> {
  try {
    const updateDataAndStatusRequest: BridgersUpdateDataAndStatusRequest = {
      hash: srcTxHash,
      fromTokenChain: toBridgersBlockchain[fromBlockchain],
      sourceFlag,
      ...(slippage && { slippage: slippage.toString() })
    };
    const updateDataAndStatusResponse = await firstValueFrom(
      httpClient.post<BridgersUpdateDataAndStatusResponse>(
        'https://sswap.swft.pro/api/exchangeRecord/updateDataAndStatus',
        updateDataAndStatusRequest
      )
    );
    const orderId = updateDataAndStatusResponse.data?.orderId;
    if (!orderId) {
      return {
        status: TX_STATUS.PENDING,
        hash: null
      };
    }

    const getTransDataByIdRequest: BridgersGetTransDataByIdRequest = {
      orderId
    };
    const getTransDataByIdResponse = await firstValueFrom(
      httpClient.post<BridgersGetTransDataByIdResponse>(
        'https://sswap.swft.pro/api/exchangeRecord/getTransDataById',
        getTransDataByIdRequest
      )
    );
    const transactionData = getTransDataByIdResponse.data;
    if (!transactionData?.status) {
      return {
        status: TX_STATUS.PENDING,
        hash: null
      };
    }

    if (transactionData.status === 'receive_complete') {
      return {
        status: TX_STATUS.SUCCESS,
        hash: transactionData.toHash
      };
    }
    if (transactionData.status.includes('error') || transactionData.status.includes('fail')) {
      return {
        status: TX_STATUS.FAIL,
        hash: null
      };
    }
  } catch (err) {
    console.debug('[ERROR_getBridgersTradeStatus]', err);
  }

  return {
    status: TX_STATUS.PENDING,
    hash: null
  };
}
