import { BLOCKCHAIN_NAME } from '@cryptorubic/core';

export const CLEARSWAP_SUPPORTED_CHAINS = [BLOCKCHAIN_NAME.TRON] as const;

export type ClearswapSupportedChain = (typeof CLEARSWAP_SUPPORTED_CHAINS)[number];
