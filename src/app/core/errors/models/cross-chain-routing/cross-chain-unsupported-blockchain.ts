import { ERROR_TYPE } from '@core/errors/models/error-type';
import { BlockchainName } from 'rubic-sdk';
import { RubicError } from '@core/errors/models/rubic-error';

class CrossChainUnsupportedBlockchain extends RubicError<ERROR_TYPE.TEXT> {
  constructor(unsupportedBlockchain?: BlockchainName) {
    const message = unsupportedBlockchain
      ? `Swaps to and from ${unsupportedBlockchain} are temporarily disabled for extended maintenance.`
      : 'Selected blockchains are not supported in Cross-Chain.';
    super(null, {}, message);
    Object.setPrototypeOf(this, CrossChainUnsupportedBlockchain.prototype);
  }
}

export default CrossChainUnsupportedBlockchain;
