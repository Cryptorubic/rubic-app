import { RubicError } from '@core/errors/models/rubic-error';
import { ERROR_TYPE } from '@core/errors/models/error-type';
import { TransactionRevertedError as SdkTransactionRevertedError } from 'rubic-sdk/lib/common/errors/blockchain/transaction-reverted.error';
import TransactionRevertedError from '@core/errors/models/common/transaction-reverted-error';
import { FailedToCheckForTransactionReceiptError as SdkFailedToCheckForTransactionReceiptError } from 'rubic-sdk/lib/common/errors/swap/failed-to-check-for-transaction-receipt.error';
import FailedToCheckForTransactionReceiptError from '@core/errors/models/common/failed-to-check-for-transaction-receipt-error';
import { UserRejectError as SdkUserRejectError } from 'rubic-sdk/lib/common/errors/blockchain/user-reject.error';
import { UserRejectError } from '@core/errors/models/provider/user-reject-error';
import { InsufficientFundsError as SdkInsufficientFundsError } from 'rubic-sdk/lib/common/errors/swap/insufficient-funds.error';
import InsufficientFundsError from '@core/errors/models/instant-trade/insufficient-funds-error';
import { LowGasError as SdkLowGasError } from 'rubic-sdk/lib/common/errors/blockchain/low-gas.error';
import { LowGasError } from '@core/errors/models/provider/low-gas-error';
import { LowSlippageDeflationaryTokenError as SdkLowSlippageDeflationaryTokenError } from 'rubic-sdk/lib/common/errors/swap/low-slippage-deflationary-token.error';
import { TokenWithFeeError } from '@core/errors/models/common/token-with-fee-error';
import { RubicSdkError } from 'rubic-sdk';

export class RubicSdkErrorParser {
  private static parseErrorByType(
    err: RubicError<ERROR_TYPE> | RubicSdkError
  ): RubicError<ERROR_TYPE> | undefined {
    if (err instanceof SdkTransactionRevertedError) {
      return new TransactionRevertedError();
    }
    if (err instanceof SdkFailedToCheckForTransactionReceiptError) {
      return new FailedToCheckForTransactionReceiptError();
    }
    if (err instanceof SdkUserRejectError) {
      return new UserRejectError();
    }
    if (err instanceof SdkInsufficientFundsError) {
      return new InsufficientFundsError(err.tokenSymbol, err.balance, err.requiredBalance);
    }
    if (err instanceof SdkLowGasError) {
      return new LowGasError();
    }
    if (err instanceof SdkLowSlippageDeflationaryTokenError) {
      return new TokenWithFeeError();
    }

    return new RubicError('[RUBIC SDK] Unknown SDK error.');
  }

  private static parseErrorByMessage(
    err: RubicError<ERROR_TYPE> | RubicSdkError
  ): RubicError<ERROR_TYPE> | undefined {
    if (err.message.includes('Request failed with status code 400')) {
      return new RubicError(
        'Oneinch provider is unavailable. Try to choose another or wait a few minutes.'
      );
    }
    if (err.message.includes('max fee per gas less than block base fee')) {
      return new RubicError(
        'Max fee per gas less than block base fee. Increase max gas in your wallet.'
      );
    }
    return new RubicError(err.message);
  }

  public static parseError(err: RubicError<ERROR_TYPE> | RubicSdkError): RubicError<ERROR_TYPE> {
    if (err instanceof RubicSdkError) {
      return RubicSdkErrorParser.parseErrorByType(err);
    }
    if (err?.message) {
      return RubicSdkErrorParser.parseErrorByMessage(err);
    }

    return err;
  }
}
