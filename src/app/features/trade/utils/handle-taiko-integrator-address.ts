import { BLOCKCHAIN_NAME, BlockchainName, CrossChainManagerCalculationOptions } from 'rubic-sdk';
import {
  TAIKO_INTEGRATOR_ADDRESS_CROSS_CHAIN,
  TAIKO_INTEGRATOR_ADDRESS_ON_CHAIN
} from '../constants/calculation';

export function handleTaikoIntegratorAddress(
  options: Pick<CrossChainManagerCalculationOptions, 'providerAddress'>,
  fromBlockchain: BlockchainName,
  toBlockchain: BlockchainName
): void {
  if (fromBlockchain === toBlockchain && fromBlockchain === BLOCKCHAIN_NAME.TAIKO) {
    options.providerAddress = TAIKO_INTEGRATOR_ADDRESS_ON_CHAIN;
  } else if (fromBlockchain === BLOCKCHAIN_NAME.TAIKO || toBlockchain === BLOCKCHAIN_NAME.TAIKO) {
    options.providerAddress = TAIKO_INTEGRATOR_ADDRESS_CROSS_CHAIN;
  }
}
