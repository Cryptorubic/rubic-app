import { MarkRequired } from '../../../cross-chain/calculation-manager/models/cross-chain-manager-options';
import { OnChainManagerCalculationOptions } from './on-chain-manager-calculation-options';

export type RequiredOnChainManagerCalculationOptions = MarkRequired<
  OnChainManagerCalculationOptions,
  'timeout' | 'disabledProviders' | 'providerAddress' | 'useProxy' | 'withDeflation'
>;
