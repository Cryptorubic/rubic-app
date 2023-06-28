export interface MetaMaskGasResponse {
  estimatedBaseFee: string;
  low: { suggestedMaxPriorityFeePerGas: string; suggestedMaxFeePerGas: string };
}
