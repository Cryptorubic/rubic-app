import { SdkLegacyService } from '@app/core/services/sdk/sdk-legacy/sdk-legacy.service';
import { BlockchainName } from '@cryptorubic/core';
import { AbstractAdapter, Web3Pure } from '@cryptorubic/web3';

export function getChainAdapterSafe(
  chain: BlockchainName,
  walletAddress: string,
  sdkLegacyService: SdkLegacyService
): AbstractAdapter<{}, {}, any> | null {
  try {
    const adapter = sdkLegacyService.adaptersFactoryService.getAdapter(chain as any);
    const isBlockchainCorrect = Web3Pure.isAddressCorrect(chain, walletAddress);
    if (!isBlockchainCorrect) {
      return null;
    }

    return adapter;
  } catch {
    return null;
  }
}
