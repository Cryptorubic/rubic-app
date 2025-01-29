import {
  BlockchainName,
  BlockchainsInfo,
  CHAIN_TYPE,
  ChainType,
  Injector,
  Web3Public,
  Web3Pure
} from 'rubic-sdk';
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

export function getWeb3PublicSafe(chain: BlockchainName): Web3Public | null {
  try {
    const web3Public = Injector.web3PublicService.getWeb3Public(chain) as Web3Public;
    return web3Public;
  } catch {
    return null;
  }
}
