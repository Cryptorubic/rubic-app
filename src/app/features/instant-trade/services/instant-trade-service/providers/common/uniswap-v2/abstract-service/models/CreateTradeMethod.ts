import { ItOptions } from 'src/app/features/instant-trade/services/instant-trade-service/models/ItProvider';
import { TransactionReceipt } from 'web3-eth';
import { UniswapV2Trade } from 'src/app/features/instant-trade/services/instant-trade-service/providers/common/uniswap-v2/abstract-service/models/UniswapV2Trade';

export type CreateTradeMethod = (
  trade: UniswapV2Trade,
  options: ItOptions,
  gasLimit: string,
  gasPrice?: string
) => Promise<TransactionReceipt>;
