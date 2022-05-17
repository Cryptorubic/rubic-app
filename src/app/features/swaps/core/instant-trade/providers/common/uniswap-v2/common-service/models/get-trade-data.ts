import { ItOptions } from '@features/swaps/core/instant-trade/models/it-provider';
import { UniswapV2Trade } from '@features/swaps/core/instant-trade/providers/common/uniswap-v2/common-service/models/uniswap-v2-trade';
import { TradeContractData } from '@features/swaps/core/instant-trade/providers/common/uniswap-v2/common-service/models/trade-contract-data';

export type GetTradeData = (
  trade: UniswapV2Trade,
  options: ItOptions,
  gasLimit: string,
  gasPrice?: string
) => TradeContractData;
