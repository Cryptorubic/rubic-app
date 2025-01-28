import { BlockchainsInfo, CHAIN_TYPE, ChainType, Web3Pure } from 'rubic-sdk';
import { TokenAmount } from '@shared/models/tokens/token-amount';

export function isNativeAddressSafe(token: TokenAmount): boolean {
  let chainType: ChainType;
  try {
    chainType = BlockchainsInfo.getChainType(token.blockchain);
  } catch {
    chainType = CHAIN_TYPE.EVM;
  }

  return Web3Pure[chainType].isNativeAddress(token.address);
}
