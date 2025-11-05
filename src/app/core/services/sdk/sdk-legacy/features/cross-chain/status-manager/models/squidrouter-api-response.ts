import { SquidrouterTransferStatus } from './squidrouter-transfer-status.enum';

export interface SquidrouterApiResponse {
    readonly id: string;
    readonly status: SquidrouterTransferStatus;
    readonly toChain: {
        readonly transactionId?: string;
    };
    readonly error:
        | {
              readonly message: string;
              readonly txHash: string;
          }
        | {
              readonly errorType: string;
              readonly message: string;
          }[];
}
