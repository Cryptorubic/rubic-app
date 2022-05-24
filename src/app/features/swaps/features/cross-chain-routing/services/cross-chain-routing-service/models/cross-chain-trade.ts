import BigNumber from 'bignumber.js';
import InstantTrade from '@features/swaps/features/instant-trade/models/instant-trade';
import { TokenAmount } from '@shared/models/tokens/token-amount';
import { SupportedCrossChainBlockchain } from '@features/swaps/features/cross-chain-routing/services/cross-chain-routing-service/models/supported-cross-chain-blockchain';

export interface CrossChainTrade {
  // from blockchain data
  fromBlockchain: SupportedCrossChainBlockchain;
  fromProviderIndex: number;
  tokenIn: TokenAmount;
  tokenInAmount: BigNumber;
  fromTransitTokenAmount: BigNumber;
  fromSlippage: number;
  fromTrade: InstantTrade | null; // `null` means `tokenIn` = `transitToken`

  // to blockchain data
  toBlockchain: SupportedCrossChainBlockchain;
  toProviderIndex: number;
  toTransitTokenAmount: BigNumber;
  tokenOut: TokenAmount;
  tokenOutAmount: BigNumber;
  toSlippage: number;
  toTrade: InstantTrade | null; // `null` means `tokenOut` = `transitToken`

  usingCelerBridge: boolean; // true if bridging pair of tokens through Celer bridge

  // fee data
  transitTokenFee: number; // in percents
  cryptoFee: BigNumber; // in Eth units

  // gas data
  gasLimit?: BigNumber;
  gasPrice?: string; // in Wei
}
