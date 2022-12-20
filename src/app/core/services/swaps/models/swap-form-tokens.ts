import { BlockchainName } from 'rubic-sdk';
import { TokenAmount } from '@shared/models/tokens/token-amount';
import { SwapFormInput } from '@core/services/swaps/models/swap-form-controls';

export interface SwapFormInputTokens extends SwapFormInput {
  fromBlockchain: BlockchainName | null;
  fromToken: TokenAmount | null;
}
