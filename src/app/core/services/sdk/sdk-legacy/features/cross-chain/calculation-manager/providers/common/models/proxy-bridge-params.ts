import { PriceTokenAmount } from '@cryptorubic/core';
import { EvmOnChainTrade } from '../../../../../on-chain/calculation-manager/common/on-chain-trade/evm-on-chain-trade/evm-on-chain-trade';

export interface ProxyBridgeParams {
  walletAddress: string;
  fromTokenAmount: PriceTokenAmount;
  toTokenAmount: PriceTokenAmount;
  toAddress?: string;
  srcChainTrade: EvmOnChainTrade | null;
  providerAddress: string;
  type: string;
  fromAddress: string;
  dstChainTrade?: EvmOnChainTrade;
}
