import { RangoResponseToken } from './rango-api-common-types';

export const RANGO_SWAP_STATUS = {
  SUCCESS: 'success',
  FAILED: 'failed',
  RUNNING: 'running'
} as const;

export type RangoSwapStatus = (typeof RANGO_SWAP_STATUS)[keyof typeof RANGO_SWAP_STATUS];

export interface RangoTxStatusResponse {
  status: RangoSwapStatus | null;
  error: string | null;
  output: RangoStatusOutput | null;
  explorerUrl: RangoSwapExplorerUrl[] | null;
  bridgeData: RangoBridgeData | null;
}

interface RangoStatusOutput {
  amount: string;
  receivedToken: RangoResponseToken;
  type: 'REVERTED_TO_INPUT' | 'MIDDLE_ASSET_IN_SRC' | 'MIDDLE_ASSET_IN_DEST' | 'DESIRED_OUTPUT';
}

interface RangoSwapExplorerUrl {
  description: string | null;
  url: string;
}

interface RangoBridgeData {
  srcChainId: number;
  srcTxHash: string | null;
  srcToken: string | null;
  srcTokenAmt: string;
  srcTokenDecimals: number;
  srcTokenPrice: string | null;
  destChainId: number;
  destTxHash: string | null;
  destToken: string | null;
  destTokenAmt: string | null;
  destTokenDecimals: number;
  destTokenPrice: string | null;
}
