import { ExecutionRevertedError } from './common/execution-reverted-error';
import { InsufficientGasError } from './common/insufficient-gas-error';
import UnsupportedReceiverAddressError from './common/unsupported-receiver-address-error';
import { ERROR_TYPE } from './error-type';
import { API_ERROR_CODES, RubicApiError } from './rubic-api-error';
import { RubicError } from './rubic-error';
import { UnknownError } from './unknown.error';
import InvalidTradeIdError from './common/invalid-trade-id-error';
import InsufficientFundsError from './instant-trade/insufficient-funds-error';

export function isRawApiError(err: object): err is RubicApiError {
  return (
    'response' in err &&
    typeof err.response === 'object' &&
    'code' in err.response &&
    'reason' in err.response
  );
}

export class RubicApiErrorParser {
  public static parseErrorByCode(apiErr: RubicApiError): RubicError<ERROR_TYPE> {
    if (apiErr.response.code === API_ERROR_CODES.UNSUPPORTED_RECEIVER) {
      return new UnsupportedReceiverAddressError();
    }
    if (apiErr.response.code === API_ERROR_CODES.SIMULATION_FAILED) {
      return new ExecutionRevertedError(apiErr.response.reason);
    }
    if (apiErr.response.code === API_ERROR_CODES.NOT_ENOUGH_BALANCE) {
      const data = apiErr.response.data as { tokenSymbol: string };
      return new InsufficientFundsError(data.tokenSymbol);
    }
    if (apiErr.response.code === API_ERROR_CODES.NOT_ENOUGH_NATIVE_FOR_GAS) {
      return new InsufficientGasError();
    }
    if (apiErr.response.code === API_ERROR_CODES.INVALID_TRADE_ID) {
      return new InvalidTradeIdError(apiErr.id);
    }

    return new UnknownError();
  }
}
