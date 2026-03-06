import { BLOCKCHAIN_NAME, nativeTokensList } from '@cryptorubic/core';

export const PRIVACYCASH_SUPPORTED_CHAINS = [BLOCKCHAIN_NAME.SOLANA] as const;

export type PrivacycashSupportedChain = (typeof PRIVACYCASH_SUPPORTED_CHAINS)[number];

export const PRIVACYCASH_SUPPORTED_TOKENS: Record<PrivacycashSupportedChain, string[]> = {
  [BLOCKCHAIN_NAME.SOLANA]: [
    nativeTokensList.SOLANA.address,
    'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
    'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'
  ]
};
