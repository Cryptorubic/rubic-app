import { TokenAmount } from '@app/shared/models/tokens/token-amount';

export interface AlternativeRouteDTO {
  token_pairs: AlternativeTokenPairs[];
}

export interface AlternativeTokenPairs {
  destinationTokenAddress: string;
  destinationTokenDecimals: number;
  destinationTokenNetwork: string;
  destinationTokenRank: number;
  destinationTokenSymbol: string;
  destinationTokenTitle: string;
  sourceTokenAddress: string;
  sourceTokenDecimals: number;
  sourceTokenNetwork: string;
  sourceTokenRank: number;
  sourceTokenSymbol: string;
  sourceTokenTitle: string;
  totalRank: number;
}

export interface AlternativeRoute {
  from: TokenAmount;
  to: TokenAmount;
}
