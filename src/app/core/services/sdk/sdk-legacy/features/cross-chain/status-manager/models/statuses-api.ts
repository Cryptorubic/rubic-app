import { TxStatusData } from '../../../common/status-manager/models/tx-status-data';
import { SymbiosisToken } from '../../calculation-manager/providers/symbiosis-provider/models/symbiosis-trade-data';
import { CelerTransferStatus } from './celer-transfer-status.enum';
import { CrossChainTradeData } from './cross-chain-trade-data';

export interface DeBridgeFilteredListApiResponse {
    orderIds: [string];
}

export interface DeBridgeOrderApiStatusResponse {
    orderId: string;
    status: DeBridgeApiStateStatus;
}

export interface DeBridgeOrderApiResponse {
    fulfilledDstEventMetadata: {
        transactionHash: {
            stringValue: string;
        };
    };
}

export const DE_BRIDGE_API_STATE_STATUS = {
    FULFILLED: 'Fulfilled',
    SENTUNLOCK: 'SentUnlock',
    CLAIMEDUNLOCK: 'ClaimedUnlock',
    ORDERCANCELLED: 'OrderCancelled',
    SENTORDERCANCEL: 'SentOrderCancel',
    CLAIMEDORDERCANCEL: 'ClaimedOrderCancel',
    CREATED: 'Created'
} as const;

export type DeBridgeApiStateStatus = (typeof DE_BRIDGE_API_STATE_STATUS)[keyof typeof DE_BRIDGE_API_STATE_STATUS];

export interface SymbiosisApiResponse {
    status: {
        code: string;
        text: string;
    };
    tx: {
        hash: string;
        chainId: number;
    } | null;
    transitTokenSent: SymbiosisToken | null;
}

export interface BtcStatusResponse {
    block_height: number | undefined;
    block_index: number | undefined;
    double_spend: boolean;
    fee: number;
    hash: string;
    inputs: unknown[];
    lock_time: number;
    out: unknown[];
    relayed_by: string;
    size: number;
    time: number;
    tx_index: number;
    ver: number;
    vin_sz: number;
    vout_sz: number;
    weight: number;
}

export interface CelerXtransferStatusResponse {
    err: string;
    txSearchInfo: {
        transfer: {
            xfer_id: string;
            dst_tx_hash: string;
            xfer_status: CelerTransferStatus;
        }[];
    }[];
}

export type GetDstTxDataFn = (data: CrossChainTradeData) => Promise<TxStatusData>;
