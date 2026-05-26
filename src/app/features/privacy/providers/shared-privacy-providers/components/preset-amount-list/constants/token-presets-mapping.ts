import { TokenType } from '@app/shared/models/tokens/token';

const NATIVE_WRAPPED_PRESETS = ['0.01', '0.05', '0.1', '0.5', '1'];
export const DEFAULT_PRESETS = ['0.1', '1', '10', '50', '100'];
export const SOLANA_NATIVE_PRESETS = ['0.01', '0.1', '0.5', '1', '5'];

export const TOKEN_PRESETS_MAPPING: Partial<Record<TokenType, string[]>> = {
  NATIVE_ETH: NATIVE_WRAPPED_PRESETS,
  NATIVE: NATIVE_WRAPPED_PRESETS,
  WRAPPED_NATIVE: NATIVE_WRAPPED_PRESETS,
  STABLE: ['10', '50', '100', '500', '1000']
};
