import { CrossChainTrade } from '@app/core/services/sdk/sdk-legacy/features/cross-chain/calculation-manager/providers/common/cross-chain-trade';
import { OnChainTrade } from '@app/core/services/sdk/sdk-legacy/features/on-chain/calculation-manager/common/on-chain-trade/on-chain-trade';
import { BLOCKCHAIN_NAME, CROSS_CHAIN_TRADE_TYPE } from '@cryptorubic/core';

export function isArbitrumBridgeRbcTrade(trade: CrossChainTrade | OnChainTrade): boolean {
  return (
    trade.type === CROSS_CHAIN_TRADE_TYPE.ARBITRUM &&
    trade.from.blockchain === BLOCKCHAIN_NAME.ARBITRUM &&
    trade.to.blockchain === BLOCKCHAIN_NAME.ETHEREUM
  );
}
