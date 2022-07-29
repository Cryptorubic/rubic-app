import CustomError from '@core/errors/models/custom-error';
import { BlockchainName } from 'rubic-sdk';

class IsNotEthLikeError extends CustomError {
  constructor(blockchain: BlockchainName) {
    super(`${blockchain} is not eth-like blockchain`);
    Object.setPrototypeOf(this, IsNotEthLikeError.prototype);
  }
}

export default IsNotEthLikeError;
