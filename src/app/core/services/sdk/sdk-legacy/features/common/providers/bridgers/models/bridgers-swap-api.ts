import { BridgersSourceFlag } from './bridgers-source-flag';
import { EvmBridgersTransactionData } from '../../../../cross-chain/calculation-manager/providers/bridgers-provider/models/evm-bridgers-transaction-data';
import { TronBridgersTransactionData } from '../../../../cross-chain/calculation-manager/providers/bridgers-provider/models/tron-bridgers-transaction-data';

export interface BridgersSwapRequest {
    fromTokenAddress: string;
    toTokenAddress: string;
    fromAddress: string;
    toAddress: string;
    fromTokenChain: string;
    toTokenChain: string;
    fromTokenAmount: string;
    amountOutMin: string;
    equipmentNo: string;
    sourceFlag: BridgersSourceFlag;
}

export interface BridgersSwapResponse<T extends EvmBridgersTransactionData | TronBridgersTransactionData> {
    data: {
        txData: T;
    };
    resCode: number;
}
