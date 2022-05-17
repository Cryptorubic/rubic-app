import { UniswapV2Trade } from '@features/swaps/core/instant-trade/providers/common/uniswap-v2/common-service/models/uniswap-v2-trade';
import { TradeContractData } from '@features/swaps/core/instant-trade/providers/common/uniswap-v2/common-service/models/trade-contract-data';

export type GetTradeSupportingFeeData = (trade: UniswapV2Trade) => TradeContractData;
