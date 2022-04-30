export interface SwapInfoDest {
  dex: string;
  integrator: string;
  version: number;
  path: string[];
  pathV3: string | string[];
  deadline: number;
  amountOutMinimum: string;
}
