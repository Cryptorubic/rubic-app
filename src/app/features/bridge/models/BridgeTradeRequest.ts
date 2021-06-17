export interface BridgeTradeRequest {
  toAddress: string;
  onTransactionHash?: (hash: string) => void;
}
