import { BLOCKCHAIN_NAME, BlockchainName, nativeTokensList } from '@cryptorubic/core';
import { WRAP_SOL_ADDRESS } from '../constants/privacycash-consts';
import { TokensFacadeService } from '@app/core/services/tokens/tokens-facade.service';
import { BalanceToken } from '@app/shared/models/tokens/balance-token';

export function toRubicTokenAddr(tokenAddr: string): string {
  return tokenAddr === WRAP_SOL_ADDRESS ? nativeTokensList.SOLANA.address : tokenAddr;
}

export function toPrivacyCashTokenAddr(tokenAddr: string): string {
  return tokenAddr === nativeTokensList.SOLANA.address ? WRAP_SOL_ADDRESS : tokenAddr;
}

export function findPrivacyCashCompatibleToken(
  tokensFacade: TokensFacadeService,
  tokenAddr: string,
  chain: BlockchainName = BLOCKCHAIN_NAME.SOLANA
): BalanceToken {
  const rubicToken = tokensFacade.findTokenSync({
    address: toRubicTokenAddr(tokenAddr),
    blockchain: chain
  });
  if (!rubicToken) {
    throw new Error(`[findPrivacyCashCompatibleToken] token ${tokenAddr} not found in store.`);
  }
  return { ...rubicToken, address: toPrivacyCashTokenAddr(tokenAddr) };
}
