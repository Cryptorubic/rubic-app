import { BLOCKCHAIN_NAME, BlockchainName, CrossChainManagerCalculationOptions } from 'rubic-sdk';
import {
  LINEA_INTEGRATOR_ADDRESS_CCR,
  MERLIN_INTEGRATOR_ADDRESS,
  RUBIC_BDAY_ADDRESS,
  TAIKO_INTEGRATOR_ADDRESS_CROSS_CHAIN,
  TAIKO_INTEGRATOR_ADDRESS_ON_CHAIN,
  XLAYER_INTEGRATOR_ADDRESS_CROSS_CHAIN,
  XLAYER_INTEGRATOR_ADDRESS_ON_CHAIN
} from '../constants/calculation';

// eslint-disable-next-line complexity
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

  const useMerlinIntegrator =
    (fromBlockchain === BLOCKCHAIN_NAME.MERLIN || toBlockchain === BLOCKCHAIN_NAME.MERLIN) &&
    !crossChainIntegrator &&
    !onChainIntegrator;

  const useXLayerIntegratorOnChain =
    fromBlockchain === toBlockchain &&
    fromBlockchain === BLOCKCHAIN_NAME.XLAYER &&
    !onChainIntegrator;

  const useXLayerIntegratorCcr =
    (fromBlockchain === BLOCKCHAIN_NAME.XLAYER || toBlockchain === BLOCKCHAIN_NAME.XLAYER) &&
    !crossChainIntegrator;

  const useRubicBdayIntegrator =
    fromBlockchain === BLOCKCHAIN_NAME.SCROLL || toBlockchain === BLOCKCHAIN_NAME.SCROLL;

  const useLineaIntegratorCcr = fromBlockchain === BLOCKCHAIN_NAME.LINEA && !crossChainIntegrator;

  const useLineaIntegratorOnChain =
    fromBlockchain === BLOCKCHAIN_NAME.LINEA &&
    toBlockchain === fromBlockchain &&
    !onChainIntegrator;

  if (useTaikoIntegratorOnChain) {
    options.providerAddress = TAIKO_INTEGRATOR_ADDRESS_ON_CHAIN;
  } else if (useTaikoIntegratorCcr) {
    options.providerAddress = TAIKO_INTEGRATOR_ADDRESS_CROSS_CHAIN;
  } else if (useMerlinIntegrator) {
    options.providerAddress = MERLIN_INTEGRATOR_ADDRESS;
  } else if (useXLayerIntegratorOnChain) {
    options.providerAddress = XLAYER_INTEGRATOR_ADDRESS_ON_CHAIN;
  } else if (useXLayerIntegratorCcr) {
    options.providerAddress = XLAYER_INTEGRATOR_ADDRESS_CROSS_CHAIN;
  } else if (useRubicBdayIntegrator) {
    options.providerAddress = RUBIC_BDAY_ADDRESS;
  } else if (useLineaIntegratorOnChain) {
    options.providerAddress = RUBIC_BDAY_ADDRESS;
  } else if (useLineaIntegratorCcr) {
    options.providerAddress = LINEA_INTEGRATOR_ADDRESS_CCR;
  }
}
