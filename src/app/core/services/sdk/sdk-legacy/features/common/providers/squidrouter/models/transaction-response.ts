import { SquidrouterEstimation } from './estimation-response';
import { SquidrouterTransactionRequest } from './transaction-request';

export interface SquirouterTransaction {
    readonly routeType: string;
    readonly target: string;
    readonly data: string;
    readonly value: string;
    readonly gasLimit: string;
    readonly gasPrice: string;
    readonly maxFeePerGas: string;
    readonly maxPriorityFeePerGas: string;
}

/**
 * Swap transaction response.
 */
export interface SquidrouterTransactionResponse {
    readonly route: {
        /**
         * Trade estimation response.
         */
        readonly estimate: SquidrouterEstimation;

        /**
         * Transaction data.
         */
        readonly transactionRequest: SquirouterTransaction;

        readonly params: SquidrouterTransactionRequest;
    };
    'x-request-id': string;
}

export interface SquidrouterTxStatusParams {
    requestId: string;
    transactionId: string;
    fromChainId: string;
    toChainId: string;
}
