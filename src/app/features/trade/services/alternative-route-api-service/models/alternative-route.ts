import { TokenAmount } from '@app/shared/models/tokens/token-amount';
import BigNumber from 'bignumber.js';

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
  destinationTokenUsdPrice: number;
  sourceTokenUsdPrice: number;
}

export interface AlternativeRoute {
  from: TokenAmount;
  to: TokenAmount;
  amount: BigNumber;
}
