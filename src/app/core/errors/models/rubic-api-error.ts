export interface RubicApiError {
  id: string;
  name: string;
  response: {
    code: ApiErrorCode;
    reason: string;
  };
  status: number;
}

export const API_ERROR_CODES = {
  UNKNOWN_ERROR: 300,
  INVALID_TRADE_ID: 301,
  DIFFERENT_QUOTES: 302,
  NO_PROVIDERS_FOUND: 303,
  ERROR_ON_PROVIDER_SIDE: 304,
  NEED_APPROVE: 305,
  NOT_ENOUGH_BALANCE: 306,
  NOT_ENOUGH_NATIVE_FOR_GAS: 307,
  SIMULATION_FAILED: 308,
  DST_SRC_TOKENS_EQUAL: 309,
  CHAIN_DISABLED: 310,
  UNSUPPORTED_RECEIVER: 311,
  REQUIRED_FIELD_EMPTY: 400,
  NEED_AUTH_WALLET: 409
} as const;

type ApiErrorCode = (typeof API_ERROR_CODES)[keyof typeof API_ERROR_CODES];
