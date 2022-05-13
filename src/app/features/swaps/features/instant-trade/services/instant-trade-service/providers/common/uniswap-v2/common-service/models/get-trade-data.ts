import { ItOptions } from '@features/swaps/features/instant-trade/services/instant-trade-service/models/it-provider';
import { UniswapV2Trade } from '@features/swaps/features/instant-trade/services/instant-trade-service/providers/common/uniswap-v2/common-service/models/uniswap-v2-trade';
import { TradeContractData } from '@features/swaps/features/instant-trade/services/instant-trade-service/providers/common/uniswap-v2/common-service/models/trade-contract-data';

export type GetTradeData = (
  trade: UniswapV2Trade,
  options: ItOptions,
  gasLimit: string,
  gasPrice?: string
) => TradeContractData;
