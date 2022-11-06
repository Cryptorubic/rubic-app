import { WrappedCrossChainTrade } from 'rubic-sdk';
import { SmartRouting } from './smart-routing.interface';

export type CrossChainProviderTrade = WrappedCrossChainTrade & {
  needApprove: boolean;
  totalProviders: number;
  currentProviders: number;
  smartRouting: SmartRouting | null;
};
