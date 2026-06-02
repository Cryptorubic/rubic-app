export const HINKAL_PRIVATE_OPERATION = {
  UNSHIELD: 'unshield',
  TRANSFER: 'transfer',
  SWAP: 'swap'
} as const;

export type HinkalPrivateOperation =
  (typeof HINKAL_PRIVATE_OPERATION)[keyof typeof HINKAL_PRIVATE_OPERATION];
