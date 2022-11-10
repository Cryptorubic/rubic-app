import { ERROR_TYPE } from '@core/errors/models/error-type';
import { RubicWarning } from '@core/errors/models/rubic-warning';

class BlockchainIsUnavailableWarning extends RubicWarning<ERROR_TYPE.TEXT> {
  constructor(blockchainLabel: string) {
    super(`${blockchainLabel} blockchain is currently unavailable.`);
    Object.setPrototypeOf(this, BlockchainIsUnavailableWarning.prototype);
  }
}

export default BlockchainIsUnavailableWarning;
