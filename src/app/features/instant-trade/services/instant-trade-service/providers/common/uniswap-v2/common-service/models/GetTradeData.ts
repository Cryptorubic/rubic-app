import { ItOptions } from '@features/instant-trade/services/instant-trade-service/models/it-provider';
import { UniswapV2Trade } from 'src/app/features/instant-trade/services/instant-trade-service/providers/common/uniswap-v2/common-service/models/UniswapV2Trade';
import { TradeContractData } from '@features/instant-trade/services/instant-trade-service/providers/common/uniswap-v2/common-service/models/TradeContractData';

export type GetTradeData = (
  trade: UniswapV2Trade,
  options: ItOptions,
  gasLimit: string,
  gasPrice?: string
) => TradeContractData;
