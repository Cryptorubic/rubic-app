/**
 * EVM tx of Bitget order, `uniqueInfo.additionalData.bitgetTxs[]` in /routes/swap response.
 * Nonce and gas params are assigned by Bitget for the whole order and must be signed as is.
 */
export interface BitgetEvmOrderTx {
  to: string;
  calldata: string;
  value?: string;
  gasLimit?: string;
  gasPrice?: string;
  nonce?: number;
  maxFeePerGas?: string;
  maxPriorityFeePerGas?: string;
  supportEIP1559?: boolean;
}

export interface BitgetAdditionalData {
  bitgetOrderId?: string;
  bitgetDeadline?: number;
  /** EVM only: approve (optional) and swap txs, all of them must be signed in order */
  bitgetTxs?: BitgetEvmOrderTx[];
  /** Solana only */
  bitgetTxEncoding?: 'base58' | 'base64';
  bitgetTxVersion?: string;
}

export interface BitgetSignedOrder {
  signedTxs: string[];
  /** Hash of the swap tx, Bitget broadcasts exactly the signed tx */
  srcHash: string;
}
