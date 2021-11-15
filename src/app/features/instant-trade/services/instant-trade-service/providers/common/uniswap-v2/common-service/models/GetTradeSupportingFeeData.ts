import { UniswapV2Trade } from 'src/app/features/instant-trade/services/instant-trade-service/providers/common/uniswap-v2/common-service/models/UniswapV2Trade';
import { AbiItem } from 'web3-utils';

export type GetTradeSupportingFeeData = (trade: UniswapV2Trade) => {
  contractAddress: string;
  contractAbi: AbiItem[];
  methodName: string;
  methodArguments: unknown[];
};
