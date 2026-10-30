import { CrossChainTransferTrade } from '../../../../cross-chain/calculation-manager/providers/common/cross-chain-transfer-trade/cross-chain-transfer-trade';
import { CrossChainTrade } from '../../../../cross-chain/calculation-manager/providers/common/cross-chain-trade';
import { OnChainTrade } from '../on-chain-trade/on-chain-trade';
import { OnChainTransferTrade } from './on-chain-transfer-trade';

/**
 * Deposit-style trade: no wallet required, opens depositPreview with manual deposit address.
 */
export function isDepositTrade(trade: CrossChainTrade | OnChainTrade | null | undefined): boolean {
  if (!trade) {
    return false;
  }
  return trade instanceof OnChainTransferTrade || trade instanceof CrossChainTransferTrade;
}
