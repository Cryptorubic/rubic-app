import { TransferTradeType, getDepositStatusFnMap } from '../utils/get-deposit-status';

export const transferTradeSupportedProviders = Object.keys(
  getDepositStatusFnMap
) as TransferTradeType[];
