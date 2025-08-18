import {
  BlockchainName,
  BlockchainsInfo,
  CHAIN_TYPE,
  ChainType,
  Injector,
  Web3Public,
  Web3Pure
} from '@cryptorubic/sdk';
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

export async function getWeb3PublicSafe(
  chain: BlockchainName,
  walletAddress: string
): Promise<Web3Public | null> {
  try {
    const web3Public = Injector.web3PublicService.getWeb3Public(chain) as Web3Public;
    const chainType = BlockchainsInfo.getChainType(chain);
    const isBlockchainCorrect = await Web3Pure[chainType].isAddressCorrect(walletAddress);
    if (!isBlockchainCorrect) {
      return null;
    }

    return web3Public;
  } catch {
    return null;
  }
}
