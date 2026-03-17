import { PrivateSwapFormConfig } from '@app/features/privacy/providers/shared-privacy-providers/models/swap-form-types';
import { BLOCKCHAIN_NAME } from '@cryptorubic/core';

export const clearswapFormConfig: PrivateSwapFormConfig = {
  withActionButton: true,
  withDstSelector: true,
  withDstAmount: true,
  withReceiver: true,
  withSrcAmount: true,
  assetsSelectorConfig: {
    withChainsFilter: false,
    withTokensFilter: false,
    withFavoriteTokens: false,
    showAllChains: false,
    listType: BLOCKCHAIN_NAME.TRON
  }
};
