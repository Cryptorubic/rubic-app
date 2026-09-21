import { CROSS_CHAIN_TRADE_TYPE, CrossChainTradeType, OnChainTradeType } from '@cryptorubic/core';

export const specificProviderStatusText: Partial<
  Record<CrossChainTradeType | OnChainTradeType, Record<string, string>>
> = {
  [CROSS_CHAIN_TRADE_TYPE.CHANGELLY]: {
    hold: 'Please contact the Changelly’s security team at security@changelly.com to pass the KYC procedure or any other required procedures.'
  }
};
