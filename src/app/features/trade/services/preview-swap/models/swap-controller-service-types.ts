export interface CrossChainSwapAdditionalParams {
  changenowId?: string;
  rangoRequestId?: string;
}

export const APPROVE_TYPE = {
  DEFAULT: 'default',
  PERMIT_2: 'permit2'
} as const;

export type ApproveType = (typeof APPROVE_TYPE)[keyof typeof APPROVE_TYPE];
