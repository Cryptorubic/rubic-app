export const HINKAL_PRIVATE_OPERATION = {
  SWAP: 'swap',
  TRANSFER: 'transfer',
  UNSHIELD: 'unshield'
} as const;

export type HinkalPrivateOperation =
  (typeof HINKAL_PRIVATE_OPERATION)[keyof typeof HINKAL_PRIVATE_OPERATION];
