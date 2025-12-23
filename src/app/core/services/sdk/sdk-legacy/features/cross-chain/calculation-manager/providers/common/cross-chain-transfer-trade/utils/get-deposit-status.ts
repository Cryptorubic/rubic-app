import { CROSS_CHAIN_TRADE_TYPE } from '../../../../models/cross-chain-trade-type';

import { ChangellyApiService } from '../../../changelly-provider/services/changelly-api-service';
import { ChangeNowCrossChainApiService } from '../../../changenow-provider/services/changenow-cross-chain-api-service';
import { SimpleSwapApiService } from '../../../simple-swap-provider/services/simple-swap-api-service';
import {
  CROSS_CHAIN_DEPOSIT_STATUS,
  CrossChainDepositData,
  CrossChainDepositStatus
} from '../models/cross-chain-deposit-statuses';
import { RubicSdkError, TX_STATUS } from '@cryptorubic/web3';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

async function getExolixStatus(
  id: string,
  _params: GetDepositStatusFnParams,
  httpClient: HttpClient
): Promise<CrossChainDepositData> {
  const { status, hashOut } = await firstValueFrom(
    httpClient.get<{
      status: string;
      hashOut: { hash: string };
    }>(`https://exolix.com/api/v2/transactions/${id}`)
  );

  if (status === 'success' || status === 'refunded') {
    return {
      status: CROSS_CHAIN_DEPOSIT_STATUS.FINISHED,
      dstHash: hashOut.hash
    };
  }

  if (status === 'overdue') {
    return {
      status: CROSS_CHAIN_DEPOSIT_STATUS.FAILED,
      dstHash: null
    };
  }

  if (status === 'wait') {
    return {
      status: CROSS_CHAIN_DEPOSIT_STATUS.WAITING,
      dstHash: null
    };
  }

  return {
    status: status as CrossChainDepositStatus,
    dstHash: hashOut?.hash || null
  };
}

/**
 * @param id it's depositAddress (near_intents API checks dst status by unique depositAddress)
 */
async function getNearIntentsStatus(
  id: string,
  params: GetDepositStatusFnParams,
  httpClient: HttpClient
): Promise<CrossChainDepositData> {
  const { status, swapDetails } = await firstValueFrom(
    httpClient.get<{
      status:
        | 'FAILED'
        | 'SUCCESS'
        | 'PROCESSING'
        | 'REFUNDED'
        | 'PENDING_DEPOSIT'
        | 'KNOWN_DEPOSIT_TX';
      swapDetails: { destinationChainTxHashes: Array<{ hash: string }> };
    }>(`https://1click.chaindefuser.com/v0/status`, {
      headers: {
        Authorization:
          'Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IjIwMjUtMDQtMjMtdjEifQ.eyJ2IjoxLCJrZXlfdHlwZSI6ImRpc3RyaWJ1dGlvbl9jaGFubmVsIiwicGFydG5lcl9pZCI6InJ1YmljIiwiaWF0IjoxNzYxMDM3NzIzLCJleHAiOjE3OTI1NzM3MjN9.P7Hc500T0ePu8nm1FL4AoJnr0avDRpyXoKGDCNPbACv2jl_xC83B8sJIhkBErOR9T9UQP-so4yqYC_J_00I-P0je9npzDwiQT6JPP8kw8l8fcnBaupFTmKCvGA8vyXvuE6_rjh9S-ho5O1z-yq5jKYG4FhKw59ydDRxPWQFlmKJxgwMvXkuXu_dCf-e0vORN-8AiBK0JIl0Jm-0FY92moj9Zzp3SQ9y2Q41gX3iDqpVNexoAlLWlB4HjK3CcTcEu-XBQPM97J1bB45fy6yHjV7wRwN0rC3TsTJyB8Rjjt0vu0m_GZI-FrjwcyLf0W9pD8qyg3rGI_Bh2NZ4o8ToPVg'
      },
      params: {
        depositAddress: id,
        ...(params.depositMemo && { depositMemo: params.depositMemo })
      }
    })
  );

  if (status === 'SUCCESS') {
    const firstDstTxHast = swapDetails.destinationChainTxHashes[0].hash;
    return {
      status: CROSS_CHAIN_DEPOSIT_STATUS.FINISHED,
      dstHash: firstDstTxHast
    };
  }
  if (status === 'PROCESSING') {
    return {
      status: CROSS_CHAIN_DEPOSIT_STATUS.EXCHANGING,
      dstHash: null
    };
  }
  if (status === 'KNOWN_DEPOSIT_TX') {
    return {
      status: CROSS_CHAIN_DEPOSIT_STATUS.VERIFYING,
      dstHash: null
    };
  }
  if (status === 'REFUNDED') {
    return {
      status: CROSS_CHAIN_DEPOSIT_STATUS.REFUNDED,
      dstHash: null
    };
  }
  if (status === 'FAILED') {
    return {
      status: CROSS_CHAIN_DEPOSIT_STATUS.FAILED,
      dstHash: null
    };
  }

  return {
    status: CROSS_CHAIN_DEPOSIT_STATUS.WAITING,
    dstHash: null
  };
}

async function getQuickexStatus(
  id: string,
  _params: GetDepositStatusFnParams,
  httpClient: HttpClient
): Promise<CrossChainDepositData> {
  const statusResp = await firstValueFrom(
    httpClient.get<{
      completed: boolean;
      withdrawals: Array<{ txId: string }>;
    }>(`https://quickex.io/api/v2/orders/info?orderId=${id}`)
  );

  if (!statusResp.completed) {
    return {
      status: TX_STATUS.PENDING,
      dstHash: null
    };
  }

  return {
    status: CROSS_CHAIN_DEPOSIT_STATUS.FINISHED,
    dstHash: statusResp.withdrawals[statusResp.withdrawals.length - 1].txId
  };
}

export type GetDepositStatusFnParams = { depositMemo?: string };

export type getDepositStatusFn = (
  id: string,
  params: GetDepositStatusFnParams,
  httpClient: HttpClient
) => Promise<CrossChainDepositData>;

const _getDepositStatusFnMap = {
  [CROSS_CHAIN_TRADE_TYPE.CHANGENOW]: ChangeNowCrossChainApiService.getTxStatus,
  [CROSS_CHAIN_TRADE_TYPE.SIMPLE_SWAP]: SimpleSwapApiService.getTxStatus,
  [CROSS_CHAIN_TRADE_TYPE.CHANGELLY]: ChangellyApiService.getTxStatus,
  [CROSS_CHAIN_TRADE_TYPE.EXOLIX]: getExolixStatus,
  [CROSS_CHAIN_TRADE_TYPE.NEAR_INTENTS]: getNearIntentsStatus,
  [CROSS_CHAIN_TRADE_TYPE.QUICKEX]: getQuickexStatus
} as const;

export type TransferTradeType = keyof typeof _getDepositStatusFnMap;

export const getDepositStatusFnMap: Record<TransferTradeType, getDepositStatusFn> = {
  ..._getDepositStatusFnMap
} as const;

export function getDepositStatus(
  id: string,
  tradeType: TransferTradeType,
  params: GetDepositStatusFnParams,
  httpClient: HttpClient
): Promise<CrossChainDepositData> {
  const getDepositStatusFn = getDepositStatusFnMap[tradeType];

  if (!getDepositStatusFn) {
    throw new RubicSdkError('Unsupported cross chain provider');
  }

  return getDepositStatusFn(id, params, httpClient);
}
