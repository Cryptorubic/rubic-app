import BigNumber from 'bignumber.js';
import { SupportedCrossChainBlockchain } from '@features/swaps/features/cross-chain-routing/services/cross-chain-routing-service/models/supported-cross-chain-blockchain';
import InstantTrade from '@features/swaps/features/instant-trade/models/instant-trade';
import { TokenAmount } from '@shared/models/tokens/token-amount';

export enum CROSS_CHAIN_PROVIDER {
  RUBIC = 'RUBIC',
  CELER = 'CELER',
  SYMBIOSIS = 'SYMBIOSIS'
}

export type CrossChainProvider = keyof typeof CROSS_CHAIN_PROVIDER;

export interface CrossChainTrade {
  type: CrossChainProvider;
  trade: CelerRubicTrade | SymbiosisTrade;

  gasLimit?: BigNumber;
  gasPrice?: string; // in Wei
}

export interface CelerRubicTrade {
  // from blockchain data
  fromBlockchain: SupportedCrossChainBlockchain;
  fromToken: TokenAmount;
  fromAmount: BigNumber;
  fromProviderIndex: number;
  fromTransitTokenAmount: BigNumber;
  fromTrade: InstantTrade | null; // `null` means `tokenIn` = `transitToken`
  fromSlippage: number;

  // to blockchain data
  toBlockchain: SupportedCrossChainBlockchain;
  toToken: TokenAmount;
  toProviderIndex: number;
  toTransitTokenAmount: BigNumber;
  toTrade: InstantTrade | null; // `null` means `tokenOut` = `transitToken`
  toAmount: BigNumber;
  toAmountWithoutSlippage: BigNumber;
  toSlippage: number;

  usingCelerBridge: boolean; // true if bridging pair of tokens through Celer bridge

  // fee data
  transitTokenFee: number; // in percents
  cryptoFee: BigNumber; // in Eth units
}

export interface SymbiosisTrade {
  toAmount: BigNumber;

  fee: BigNumber;
  feeSymbol: string;

  priceImpact: string;
}
