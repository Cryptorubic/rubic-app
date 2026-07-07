import { ERROR_TYPE } from '@core/errors/models/error-type';
import { RubicWarning } from '@core/errors/models/rubic-warning';
import { BlockchainName } from '@cryptorubic/core';

class PhantomWalletUnsupportedChainError extends RubicWarning<ERROR_TYPE.TEXT> {
  constructor(public blockchainName: BlockchainName) {
    super(`Phantom doesn't support ${blockchainName}.`);
    Object.setPrototypeOf(this, PhantomWalletUnsupportedChainError.prototype);
  }
}

export default PhantomWalletUnsupportedChainError;
