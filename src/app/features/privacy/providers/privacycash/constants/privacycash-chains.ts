import { BLOCKCHAIN_NAME, nativeTokensList } from '@cryptorubic/core';

export const PRIVACYCASH_SUPPORTED_CHAINS = [BLOCKCHAIN_NAME.SOLANA];

export type PrivacycashSupportedChain = (typeof PRIVACYCASH_SUPPORTED_CHAINS)[number];

export const PRIVACYCASH_SUPPORTED_TOKENS: Record<PrivacycashSupportedChain, string[]> = {
  [BLOCKCHAIN_NAME.SOLANA]: [
    nativeTokensList.SOLANA.address.toLowerCase(),
    'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB'.toLowerCase(),
    'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'.toLowerCase(),
    'FLJYGHpCCcfYUdzhcfHSeSd2peb5SMajNWaCsRnhpump'.toLowerCase()
  ]
};
