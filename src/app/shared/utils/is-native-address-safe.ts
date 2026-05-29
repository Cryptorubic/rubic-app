import { SdkLegacyService } from '@app/core/services/sdk/sdk-legacy/sdk-legacy.service';
import { BlockchainName } from '@cryptorubic/core';
import { AbstractAdapter, Web3Pure } from '@cryptorubic/web3';
import { RubicAny } from '../models/utility-types/rubic-any';

export function getChainAdapterSafe(
  chain: BlockchainName,
  walletAddress: string,
  sdkLegacyService: SdkLegacyService
): AbstractAdapter<{}, {}, RubicAny> | null {
  try {
    const adapter = sdkLegacyService.adaptersFactoryService.getAdapter(chain as RubicAny);
    const isBlockchainCorrect = Web3Pure.isAddressCorrect(chain, walletAddress);
    if (!isBlockchainCorrect) {
      return null;
    }

    return adapter;
  } catch {
    return null;
  }
}
