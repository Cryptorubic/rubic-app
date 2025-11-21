import { RubicError } from '@core/errors/models/rubic-error';
import { ERROR_TYPE } from '@core/errors/models/error-type';
import { OnChainTradeType } from '@cryptorubic/core';
import { INSTANT_TRADE_STATUS } from '@features/trade/models/instant-trades-trade-status';
import { OnChainTrade } from '@app/core/services/sdk/sdk-legacy/features/on-chain/calculation-manager/common/on-chain-trade/on-chain-trade';

export interface InstantTradeProviderData {
  readonly name: OnChainTradeType;
  trade: OnChainTrade | null;
  tradeStatus: INSTANT_TRADE_STATUS;
  needApprove: boolean;
  error?: RubicError<ERROR_TYPE>;

  // UI data
  readonly label: string;
  isSelected: boolean;
  fullSize?: boolean;
}
