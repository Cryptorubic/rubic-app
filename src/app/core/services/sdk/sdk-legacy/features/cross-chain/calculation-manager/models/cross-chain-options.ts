import { RangoTradeType } from '../../../common/providers/rango/models/rango-api-trade-types';
import { CrossChainTradeType } from './cross-chain-trade-type';
import { LifiSubProvider } from '../providers/lifi-provider/models/lifi-bridge-types';
import { MarkRequired } from './utility-types';

export interface CrossChainOptions {
  /**
   * Slippage in source network (for Celer and Rubic).
   * Takes value from 0 to 1.
   */
  fromSlippageTolerance?: number;

  /**
   * Slippage in target network (for Celer and Rubic).
   * Takes value from 0 to 1.
   */
  toSlippageTolerance?: number;

  /**
   * Enables or disables gas fee calculation.
   */
  gasCalculation?: 'enabled' | 'disabled';

  /**
   * @internal
   * Integrator address.
   */
  providerAddress?: string;

  /**
   * Deadline for transaction (for Symbiosis).
   */
  deadline?: number;

  /**
   * Overall slippage (for Symbiosis).
   * Takes value from 0 to 1.
   */
  slippageTolerance?: number;

  /**
   * Address to send transaction, otherwise connected wallet is used (necessary for Symbiosis).
   */
  fromAddress?: string;

  /**
   * Address to send transaction, otherwise connected wallet is used (necessary for Symbiosis).
   */
  receiverAddress?: string;

  /**
   * Timeout for each cross-chain provider. Calculation for provider is cancelled, after timeout is passed.
   */
  timeout?: number;

  /**
   * @deprecated Will be renamed to `lifiDisabledProviders` in the next major update
   */
  lifiDisabledBridgeTypes?: LifiSubProvider[];

  /**
   * Providers disabled in platform config for rango
   */
  rangoDisabledProviders?: RangoTradeType[];

  /**
   * True, if changenow must be calculated for non-evm source blockchains.
   */
  changenowFullyEnabled?: boolean;

  useProxy?: Record<CrossChainTradeType, boolean>;

  /**
   * True if test networks are enabled.
   */
  enableTestnets?: boolean;
}

export type RequiredCrossChainOptions = MarkRequired<
  CrossChainOptions,
  | 'fromSlippageTolerance'
  | 'toSlippageTolerance'
  | 'slippageTolerance'
  | 'gasCalculation'
  | 'deadline'
  | 'providerAddress'
  | 'timeout'
  | 'changenowFullyEnabled'
  | 'enableTestnets'
>;
