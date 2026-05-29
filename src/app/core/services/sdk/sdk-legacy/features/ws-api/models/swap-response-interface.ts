import {
  CrossChainTradeType,
  ErrorInterface,
  EstimatesInterface,
  FeesInterface,
  OnChainTradeType,
  RoutingInterface,
  SwapRequestInterface,
  SwapType
} from '@cryptorubic/core';
import { UniqueProviderInfoInterface } from 'node_modules/@cryptorubic/core/src/lib/models/api/unique-provider-info.interface';

export interface SwapResponseInterface<T> {
  quote: SwapRequestInterface;
  estimate: EstimatesInterface;
  fees: FeesInterface;
  transaction: T;
  uniqueInfo?: UniqueProviderInfoInterface;
  /**
   * Specific info about quote params provide
   */
  warnings: ErrorInterface[];
  routing: RoutingInterface[];
  providerType: CrossChainTradeType | OnChainTradeType;
  swapType: SwapType;
  useRubicContract: boolean;
}
