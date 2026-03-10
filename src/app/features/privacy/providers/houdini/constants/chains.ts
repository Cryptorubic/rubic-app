import { BLOCKCHAIN_NAME } from '@cryptorubic/core';

export const HOUDINI_SUPPORTED_CHAINS = [BLOCKCHAIN_NAME.ETHEREUM] as const;

export type HoudiniSupportedChain = (typeof HOUDINI_SUPPORTED_CHAINS)[number];
