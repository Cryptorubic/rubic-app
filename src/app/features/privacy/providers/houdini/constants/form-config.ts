import { PrivateSwapFormConfig } from '@app/features/privacy/providers/shared-privacy-providers/models/swap-form-types';

export const houdiniFormConfig: PrivateSwapFormConfig = {
  withActionButton: true,
  withDstSelector: true,
  withDstAmount: true,
  withReceiver: true,
  withSrcAmount: true,
  withStatus: true,
  receiverPlaceholder: 'Enter receiver address',
  selectorType: 'public',
  assetsSelectorConfig: {
    withChainsFilter: false,
    withTokensFilter: false,
    withFavoriteTokens: false,
    showAllChains: false
  }
};
