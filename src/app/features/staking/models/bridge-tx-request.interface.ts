import { BLOCKCHAIN_NAME } from '@shared/models/blockchain/BLOCKCHAIN_NAME';

export interface BridgeTxRequestInterface {
  network: BLOCKCHAIN_NAME;
  txHash: string;
}
