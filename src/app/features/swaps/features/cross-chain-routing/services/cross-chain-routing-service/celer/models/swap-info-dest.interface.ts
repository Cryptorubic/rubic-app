export interface SwapInfoDest {
  dex: string;
  nativeOut?: boolean;
  integrator: string;
  version: number;
  path: string[];
  pathV3: string | string[];
  deadline: number;
  amountOutMinimum: string;
}
