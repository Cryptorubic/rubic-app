import { CrossChainOptions, RequiredCrossChainOptions } from './cross-chain-options';
import { CrossChainTradeType } from './cross-chain-trade-type';
import { LifiSubProvider } from '../providers/lifi-provider/models/lifi-bridge-types';

export type Prettify<Type> = Type extends Function
  ? Type
  : Extract<
      {
        [Key in keyof Type]: Type[Key];
      },
      Type
    >;

export type MarkRequired<Type, Keys extends keyof Type> = Type extends Type
  ? Prettify<Type & Required<Omit<Type, Exclude<keyof Type, Keys>>>>
  : never;

export type CrossChainManagerCalculationOptions = CrossChainOptions & {
  /**
   * An array of disabled cross-chain providers.
   */
  readonly disabledProviders?: CrossChainTradeType[];

  /**
   * @deprecated Will be renamed to `lifiDisabledProviders` in the next major update
   */
  readonly lifiDisabledBridgeTypes?: LifiSubProvider[];
};

export type RequiredCrossChainManagerCalculationOptions = MarkRequired<
  CrossChainManagerCalculationOptions,
  'disabledProviders'
> &
  RequiredCrossChainOptions;
