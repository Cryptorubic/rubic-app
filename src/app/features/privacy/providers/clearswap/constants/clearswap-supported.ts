import { BLOCKCHAIN_NAME } from '@cryptorubic/core';

export const CLEARSWAP_SUPPORTED_CHAINS = [BLOCKCHAIN_NAME.TRON] as const;

export type ClearswapSupportedChain = (typeof CLEARSWAP_SUPPORTED_CHAINS)[number];

export const CLEARSWAP_SUPPORTED_TOKENS = [
  '0x0000000000000000000000000000000000000000', // TRX
  'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t', // USDT
  'TFptbWaARrWTX5Yvy3gNG5Lm8BmhPx82Bt', // WBT
  'TUpMhErZL2fhh4sVNULAbNKLokS4GjC1F4', // TUSD
  'TCFLL5dx5ZJdKnWuesXxi1VPwjLVmWZZy9', // JST
  'TAFjULxiVgT4qWk6UZwjqwZXTSaGaqnVp4', // BTT
  'TFczxzPhnThNSqr5by8tvxsdCFRRz6cPNq', // NFT
  'TSSMHYeV2uE9qYH95DqyoCuNCzEL1NvU3S', // SUN
  'TLa2f6VPqDgRE67v1736s7bJ8Ray5wYjU7', // WIN
  'TXL6rJbvmjD46zeN1JssfgxvSo99qC8MRT' // SUNDOG
];
