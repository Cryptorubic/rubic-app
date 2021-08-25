export interface BscGasResponse {
  timestamp: string;
  slow: number;
  standard: number;
  fast: number;
  instant: number;
  block_time: number;
  last_block: number;
}
