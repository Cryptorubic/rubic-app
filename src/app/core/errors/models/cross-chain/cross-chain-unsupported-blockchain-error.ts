import { ERROR_TYPE } from '@core/errors/models/error-type';
import { RubicError } from '@core/errors/models/rubic-error';
import { BlockchainName } from '@cryptorubic/core';
import { blockchainLabel } from '@shared/constants/blockchain/blockchain-label';

class CrossChainUnsupportedBlockchainError extends RubicError<ERROR_TYPE.TEXT> {
  constructor(unsupportedBlockchain?: BlockchainName) {
    const message = unsupportedBlockchain
      ? `Swaps to and from ${blockchainLabel[unsupportedBlockchain]} are temporarily disabled for extended maintenance.`
      : 'Selected blockchains are not supported in Cross-Chain.';
    super(null, {}, message);
    Object.setPrototypeOf(this, CrossChainUnsupportedBlockchainError.prototype);
  }
}

export default CrossChainUnsupportedBlockchainError;
