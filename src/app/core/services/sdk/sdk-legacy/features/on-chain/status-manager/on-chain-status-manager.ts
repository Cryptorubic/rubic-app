import { BLOCKCHAIN_NAME, BlockchainName } from '@cryptorubic/core';
import { TxStatusData } from '../../common/status-manager/models/tx-status-data';
import { getBridgersTradeStatus } from '../../common/status-manager/utils/get-bridgers-trade-status';
import { TX_STATUS, waitFor } from '@cryptorubic/web3';
import { SdkLegacyService } from '../../../sdk-legacy.service';

export class OnChainStatusManager {
  public constructor(private readonly sdkLegacyService: SdkLegacyService) {}

  /**
   * Get Bridgers trade transaction status.
   */
  public async getBridgersSwapStatus(srcTxHash: string, slippage?: number): Promise<TxStatusData> {
    const tronAdapter = this.sdkLegacyService.adaptersFactoryService.getAdapter(
      BLOCKCHAIN_NAME.TRON
    );
    const srcTxStatus = await tronAdapter.signer.getSrcTxStatus(BLOCKCHAIN_NAME.TRON, srcTxHash);
    if (srcTxStatus === TX_STATUS.FAIL) {
      return {
        status: TX_STATUS.FAIL,
        hash: srcTxHash
      };
    }

    return getBridgersTradeStatus(
      srcTxHash,
      BLOCKCHAIN_NAME.TRON,
      'rubic',
      this.sdkLegacyService.httpClient,
      slippage
    );
  }

  public async getBitcoinTransaction(srcTxHash: string): Promise<TxStatusData> {
    return this.getSrcStatusRecursive(srcTxHash, BLOCKCHAIN_NAME.BITCOIN, 300_000);
  }

  private async getSrcStatusRecursive(
    srcTxHash: string,
    blockchain: BlockchainName,
    timeoutMs: number
  ): Promise<TxStatusData> {
    const tronAdapter = this.sdkLegacyService.adaptersFactoryService.getAdapter(
      BLOCKCHAIN_NAME.TRON
    );
    const srcTxStatus = await tronAdapter.signer.getSrcTxStatus(blockchain, srcTxHash);
    if (srcTxStatus === TX_STATUS.FAIL || srcTxStatus === TX_STATUS.SUCCESS) {
      return {
        status: srcTxStatus,
        hash: srcTxHash
      };
    }
    await waitFor(timeoutMs);

    return this.getSrcStatusRecursive(srcTxHash, blockchain, timeoutMs);
  }
}
