import {
  nativeTokensList,
  RubicSdkError,
  TransactionRevertedError as SdkTransactionRevertedError,
  FailedToCheckForTransactionReceiptError as SdkFailedToCheckForTransactionReceiptError,
  UserRejectError as SdkUserRejectError,
  InsufficientFundsError as SdkInsufficientFundsError,
  DeflationTokenLowSlippageError as SdkDeflationTokenLowSlippageError,
  LowGasError as SdkLowGasError,
  LowSlippageDeflationaryTokenError as SdkLowSlippageDeflationaryTokenError,
  InsufficientFundsOneinchError as SdkInsufficientFundsOneinchError,
  NotWhitelistedProviderError as SdkNotWhitelistedProviderError,
  WalletNotConnectedError as SdkWalletNotConnectedError,
  WrongNetworkError as SdkWrongNetworkError,
  DeflationTokenError as SdkDeflationTokenError,
  MinAmountError as SdkMinAmountError,
  MaxAmountError as SdkMaxAmountError,
  TooLowAmountError as SdkTooLowAmountError,
  UnsupportedReceiverAddressError as SdkUnsupportedReceiverAddressError,
  InsufficientFundsGasPriceValueError,
  UpdatedRatesError,
  SdkSwapErrorOnProviderSide,
  NoLinkedAccountError,
  NotSupportedRegionError,
  LowSlippageError as SdkLowSlippageError,
  SimulationFailedError as SdkSimulationFailedError
} from '@cryptorubic/sdk';
import { RubicError } from '@core/errors/models/rubic-error';
import { ERROR_TYPE } from '@core/errors/models/error-type';
import TransactionRevertedError from '@core/errors/models/common/transaction-reverted-error';
import FailedToCheckForTransactionReceiptError from '@core/errors/models/common/failed-to-check-for-transaction-receipt-error';
import { UserRejectError } from '@core/errors/models/provider/user-reject-error';
import InsufficientFundsError from '@core/errors/models/instant-trade/insufficient-funds-error';
import { LowGasError } from '@core/errors/models/provider/low-gas-error';
import { TokenWithFeeError } from '@core/errors/models/common/token-with-fee-error';
import InsufficientFundsOneinchError from '@core/errors/models/instant-trade/insufficient-funds-oneinch-error';
import NotWhitelistedProviderWarning from '@core/errors/models/common/not-whitelisted-provider-warning';
import { WalletError } from '@core/errors/models/provider/wallet-error';
import { NetworkError } from '@core/errors/models/provider/network-error';
import UnsupportedDeflationTokenWarning from './common/unsupported-deflation-token.warning';
import MinAmountError from '@core/errors/models/common/min-amount-error';
import MaxAmountError from '@core/errors/models/common/max-amount-error';
import { ExecutionRevertedError } from '@core/errors/models/common/execution-reverted-error';
import UnsupportedReceiverAddressError from '@core/errors/models/common/unsupported-receiver-address-error';
import { UserRejectNetworkSwitchError } from '@core/errors/models/provider/user-reject-network-switch-error';
import TooLowAmountError from '@core/errors/models/common/too-low-amount-error';
import AmountChangeWarning from '@core/errors/models/cross-chain/amount-change-warning';
import SwapErorOnProviderSide from './common/swap-error-on-provider-side';
import { FallbackSwapError } from './provider/fallback-swap-error';
import { NotLinkedAddressError } from './provider/not-linked-address-error';
import CrossChainSwapUnavailableWarning from '@core/errors/models/cross-chain/cross-chain-swap-unavailable-warning';
import NotSupportedRegionRubicError from './common/not-supported-region-error';
import { LowSlippageError } from './common/low-slippage-error';
import { InsufficientGasError } from './common/insufficient-gas-error';
import { OneinchUnavailableError } from './instant-trade/oneinch-unavailable-error';
import { MaxFeePerGasError } from './common/max-fee-per-gas-error';
import { SimulationFailedError } from '@core/errors/models/common/simulation-failed.error';
import DeflationTokenLowSlippageError from './common/deflation-token-low-slippage.error';

export class RubicSdkErrorParser {
  private static parseErrorByType(
    err: RubicError<ERROR_TYPE> | RubicSdkError
  ): RubicError<ERROR_TYPE> {
    if (err instanceof SdkSimulationFailedError) {
      return new SimulationFailedError(err.apiError);
    }
    if (err instanceof NotSupportedRegionError) {
      return new NotSupportedRegionRubicError();
    }
    if (err instanceof UpdatedRatesError) {
      return new AmountChangeWarning(err.oldAmount, err.newAmount);
    }
    if (err instanceof SdkTransactionRevertedError) {
      return new TransactionRevertedError();
    }
    if (err instanceof SdkTooLowAmountError) {
      return new TooLowAmountError();
    }
    if (err instanceof SdkFailedToCheckForTransactionReceiptError) {
      return new FailedToCheckForTransactionReceiptError();
    }
    if (err instanceof SdkUserRejectError) {
      return new UserRejectError();
    }
    if (err instanceof SdkInsufficientFundsError) {
      return new InsufficientFundsError(err.symbol);
    }
    if (err instanceof SdkDeflationTokenLowSlippageError) {
      return new DeflationTokenLowSlippageError(err.tokenAddress);
    }
    if (err instanceof SdkLowGasError) {
      return new LowGasError();
    }
    if (err instanceof SdkLowSlippageDeflationaryTokenError) {
      return new TokenWithFeeError();
    }
    if (err instanceof SdkInsufficientFundsOneinchError) {
      return new InsufficientFundsOneinchError(nativeTokensList[err.blockchain].symbol);
    }
    if (err instanceof SdkNotWhitelistedProviderError) {
      return new NotWhitelistedProviderWarning(err.providerRouter);
    }
    if (err instanceof SdkDeflationTokenError) {
      return new UnsupportedDeflationTokenWarning();
    }
    if (err instanceof SdkWalletNotConnectedError) {
      return new WalletError();
    }
    if (err instanceof SdkWrongNetworkError) {
      return new NetworkError(err.requiredBlockchain);
    }
    if (err instanceof SdkMinAmountError) {
      return new MinAmountError(err);
    }
    if (err instanceof SdkMaxAmountError) {
      return new MaxAmountError(err);
    }
    if (err instanceof SdkUnsupportedReceiverAddressError) {
      return new UnsupportedReceiverAddressError();
    }
    if (err instanceof SdkSwapErrorOnProviderSide) {
      return new SwapErorOnProviderSide();
    }
    if (err instanceof SdkLowSlippageError) {
      return new LowSlippageError(err.minSlippage);
    }
    if (err instanceof NoLinkedAccountError) {
      return new NotLinkedAddressError();
    }

    return RubicSdkErrorParser.parseErrorByMessage(err);
  }

  // eslint-disable-next-line complexity
  private static parseErrorByMessage(
    err: RubicError<ERROR_TYPE> | RubicSdkError
  ): RubicError<ERROR_TYPE> {
    if (err.message.includes('You rejected the network switch.')) {
      return new UserRejectNetworkSwitchError();
    }
    if (
      err.message.includes('Received amount of tokens are less then expected') ||
      err.message.includes('DODORouteProxy: Return amount is not enough')
    ) {
      return new TokenWithFeeError();
    }

    if (err.message.includes('Request failed with status code 400')) {
      return new OneinchUnavailableError();
    }
    if (err.message.includes('max fee per gas less than block base fee')) {
      return new MaxFeePerGasError();
    }
    if (
      err.message.includes('Make sure you have at least') ||
      err.stack?.includes('InsufficientFundsGasPriceValueError') ||
      err instanceof InsufficientFundsGasPriceValueError ||
      err.message.includes('Ok(OutOfFund)') ||
      err.message.includes('insufficient funds for transfer') ||
      err.message.includes('execution reverted: MetaRouter: second swap failed') ||
      err.message.includes('execution reverted: MetaRouter: other side call failed') ||
      err.message.includes('1inch sets increased costs on gas fee') ||
      err.message.includes('insufficient funds for gas * price + value') ||
      err.message.includes('insufficient balance for transfer') ||
      err.message.includes('Sender balance too low for value specified') ||
      err.message.includes('execution reverted\n0x') ||
      err.message.includes('gas required exceeds allowance')
    ) {
      return new InsufficientGasError();
    }

    if (
      err.message.includes('price change more than your slippage!') ||
      err.message.includes('Return amount is not enough') ||
      err.message.includes('execution reverted: Slippage Limit Exceeded')
    ) {
      return new LowSlippageError();
    }

    if (err.message.includes('Rubic proxy does not support non proxy Rango routers')) {
      return new CrossChainSwapUnavailableWarning();
    }

    // Backpack wallet tx errors
    if (
      err.message.toLowerCase().includes('approval denied') ||
      err.message.toLowerCase().includes('plugin closed')
    ) {
      return new UserRejectError();
    }

    return new ExecutionRevertedError(err.message);
  }

  public static parseError(
    err: RubicError<ERROR_TYPE> | RubicSdkError | Error
  ): RubicError<ERROR_TYPE> {
    if (err instanceof FallbackSwapError) {
      return new FallbackSwapError();
    }
    if (err instanceof RubicError) {
      return err;
    }

    if (err instanceof RubicSdkError) {
      return RubicSdkErrorParser.parseErrorByType(err);
    }
    return RubicSdkErrorParser.parseErrorByMessage(err);
  }
}
