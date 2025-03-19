import { BLOCKCHAIN_NAME, BlockchainName, CrossChainManagerCalculationOptions } from 'rubic-sdk';
import { MONAD_INTEGRATOR_ADDRESS } from '../constants/calculation';

export function handleIntegratorAddress(
  options: Pick<CrossChainManagerCalculationOptions, 'providerAddress'>,
  fromBlockchain: BlockchainName,
  toBlockchain: BlockchainName
): void {
  if (
    fromBlockchain === BLOCKCHAIN_NAME.MONAD_TESTNET &&
    toBlockchain === BLOCKCHAIN_NAME.MONAD_TESTNET
  ) {
    options.providerAddress = MONAD_INTEGRATOR_ADDRESS;
  }
}
