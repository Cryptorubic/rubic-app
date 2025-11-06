import { HttpTransportConfig, FallbackTransportConfig } from 'viem';
import { EvmBlockchainName } from '@cryptorubic/core';

export interface ViemConfig {
  transportConfig?: HttpTransportConfig;
  fallbackConfig?: FallbackTransportConfig;
}

export type ViemChainConfig = Partial<Record<EvmBlockchainName, ViemConfig>>;
