import { BLOCKCHAIN_NAME } from '@cryptorubic/core';

export const ZAMA_SUPPORTED_CHAINS = [BLOCKCHAIN_NAME.ETHEREUM] as const;

export type ZamaSupportedChain = (typeof ZAMA_SUPPORTED_CHAINS)[number];
