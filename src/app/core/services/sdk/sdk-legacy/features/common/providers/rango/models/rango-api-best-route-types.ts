import {
  RangoAmountRestrictionType,
  RangoExpenseType,
  RangoResponseToken,
  RangoRoutingResultType,
  RangoSwapperType
} from './rango-api-common-types';
import { RangoTradeType } from './rango-api-trade-types';

export interface RangoBestRouteRequestOptions {
  slippageTolerance: number;
  swapperGroups?: RangoTradeType[];
  swappersGroupsExclude?: boolean;
}

export interface RangoBestRouteResponse {
  requestId: string;
  resultType: RangoRoutingResultType;
  route: RangoBestRouteSimulationResult | null;
  error: string | null;
}

export interface RangoBestRouteSimulationResult {
  from: RangoResponseToken;
  to: RangoResponseToken;
  outputAmount: string;
  outputAmountMin: string;
  outputAmountUsd: number | null;
  swapper: RangoSwapperMeta;
  path: RangoQuotePath[] | null;
  fee: RangoSwapFee[];
  feeUsd: number | null;
  amountRestriction: RangoAmountRestriction | null;
  estimatedTimeInSeconds: number;
}

interface RangoSwapperMeta {
  id: string;
  title: string;
  logo: string;
  swapperGroup: string;
  types: RangoSwapperType[];
}

export interface RangoQuotePath {
  from: RangoResponseToken;
  to: RangoResponseToken;
  swapper: RangoSwapperMeta;
  swapperType: RangoSwapperType;
  expectedOutput: string;
  inputAmount: string;
  estimatedTimeInSeconds: number;
}

export interface RangoSwapFee {
  name: string;
  token: RangoResponseToken;
  expenseType: RangoExpenseType;
  amount: string;
}

interface RangoAmountRestriction {
  min: string | null;
  max: string | null;
  type: RangoAmountRestrictionType;
}
