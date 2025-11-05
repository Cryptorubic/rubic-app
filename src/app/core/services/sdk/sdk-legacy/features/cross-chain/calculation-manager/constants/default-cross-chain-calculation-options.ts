import { RequiredCrossChainManagerCalculationOptions } from '../models/cross-chain-manager-options';

export const defaultCrossChainCalculationOptions: Omit<RequiredCrossChainManagerCalculationOptions, 'providerAddress'> = {
    fromSlippageTolerance: 0.015,
    toSlippageTolerance: 0.015,
    gasCalculation: 'disabled',
    disabledProviders: [],
    timeout: 25_000,
    slippageTolerance: 0.03,
    deadline: 20,
    changenowFullyEnabled: false,
    enableTestnets: false
};
