import { BlockchainName } from 'rubic-sdk';
import { TokenAmount } from '@shared/models/tokens/token-amount';
import { SwapFormInput } from '@features/swaps/core/services/swaps-form-service/models/swap-form-controls';

export interface SwapFormInputTokens extends SwapFormInput {
  fromAssetType: BlockchainName | null;
  fromAsset: TokenAmount | null;
}
