import { BlockchainsInfo } from '@cryptorubic/core';
import { CrossChainTransferTrade } from '../../../../cross-chain/calculation-manager/providers/common/cross-chain-transfer-trade/cross-chain-transfer-trade';
import { CrossChainTrade } from '../../../../cross-chain/calculation-manager/providers/common/cross-chain-trade';
import { OnChainTrade } from '../on-chain-trade/on-chain-trade';
import { OnChainTransferTrade } from './on-chain-transfer-trade';

/**
 * Deposit-style trade: no wallet required, opens depositPreview with manual deposit address.
 * - Cross-chain: only non-EVM CrossChainTransferTrade
 * - On-chain: all OnChainTransferTrade (e.g. CLEARSWAP)
 */
export function isDepositTrade(trade: CrossChainTrade | OnChainTrade | null | undefined): boolean {
  if (!trade) {
    return false;
  }
  if (trade instanceof OnChainTransferTrade) {
    return true;
  }
  return (
    trade instanceof CrossChainTransferTrade &&
    !BlockchainsInfo.isEvmBlockchainName(trade.from.blockchain)
  );
}
