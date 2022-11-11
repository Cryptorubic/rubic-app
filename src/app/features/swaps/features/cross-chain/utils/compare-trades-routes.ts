import { CrossChainTrade } from 'rubic-sdk/lib/features/cross-chain/calculation-manager/providers/common/cross-chain-trade';

export function compareTradesRoutes(
  firstTrade: CrossChainTrade,
  secondTrade: CrossChainTrade
): boolean {
  return (
    firstTrade.onChainSubtype.from === secondTrade.onChainSubtype.from &&
    firstTrade.onChainSubtype.to === secondTrade.onChainSubtype.to &&
    firstTrade.bridgeType === secondTrade.bridgeType
  );
}
