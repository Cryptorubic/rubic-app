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
  DIFFERENT_QUOTES: 302,
  DST_SRC_TOKENS_EQUAL: 309,
  ERROR_ON_PROVIDER_SIDE: 304,
  INVALID_TRADE_ID: 301,
  NEED_APPROVE: 305,
  NOT_ENOUGH_BALANCE: 306,
  NOT_ENOUGH_NATIVE_FOR_GAS: 307,
  NO_PROVIDERS_FOUND: 303,
  REQUIRED_FIELD_EMPTY: 400,
  SIMULATION_FAILED: 308,
  UNKNOWN_ERROR: 300,
  UNSUPPORTED_RECEIVER: 310
} as const;

type ApiErrorCode = (typeof API_ERROR_CODES)[keyof typeof API_ERROR_CODES];
