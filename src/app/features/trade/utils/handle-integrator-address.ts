import { BLOCKCHAIN_NAME, BlockchainName, CrossChainManagerCalculationOptions } from 'rubic-sdk';
import {
  TAIKO_INTEGRATOR_ADDRESS_CROSS_CHAIN,
  TAIKO_INTEGRATOR_ADDRESS_ON_CHAIN
} from '../constants/calculation';

export function handleIntegratorAddress(
  options: Pick<CrossChainManagerCalculationOptions, 'providerAddress'>,
  fromBlockchain: BlockchainName,
  toBlockchain: BlockchainName
): void {
  const urlParams = new URLSearchParams(window.location.search);
  const commonIntegrator = urlParams.get('feeTarget') || urlParams.get('providerAddress');
  const crossChainIntegrator = urlParams.get('crossChainIntegratorAddress') || commonIntegrator;
  const onChainIntegrator = urlParams.get('onChainIntegratorAddress') || commonIntegrator;

  const useTaikoIntegratorOnChain =
    fromBlockchain === toBlockchain &&
    fromBlockchain === BLOCKCHAIN_NAME.TAIKO &&
    !onChainIntegrator;
  const useTaikoIntegratorCcr =
    (fromBlockchain === BLOCKCHAIN_NAME.TAIKO || toBlockchain === BLOCKCHAIN_NAME.TAIKO) &&
    !crossChainIntegrator;

  if (useTaikoIntegratorOnChain) {
    options.providerAddress = TAIKO_INTEGRATOR_ADDRESS_ON_CHAIN;
  } else if (useTaikoIntegratorCcr) {
    options.providerAddress = TAIKO_INTEGRATOR_ADDRESS_CROSS_CHAIN;
  }
}
