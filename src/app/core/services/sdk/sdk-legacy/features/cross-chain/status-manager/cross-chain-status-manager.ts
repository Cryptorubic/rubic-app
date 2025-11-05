import { TX_STATUS, TxStatus, TxStatusData } from '@cryptorubic/web3';
import { CrossChainStatus } from './models/cross-chain-status';
import { BlockchainName } from '@cryptorubic/core';
import { SdkLegacyService } from '../../../sdk-legacy.service';

/**
 * Contains methods for getting cross-chain trade statuses.
 */
export class CrossChainStatusManager {
  constructor(private readonly sdkLegacyService: SdkLegacyService) {}

  public async getCrossChainStatusExtended(
    rubicId: string,
    srcHash: string,
    fromBlockchain: BlockchainName
  ): Promise<CrossChainStatus> {
    const adapter = this.sdkLegacyService.adaptersFactoryService.getAdapter(fromBlockchain as any);
    let srcTxStatus = await adapter.client.getSrcTxStatus(fromBlockchain, srcHash);

    const dstTxData = await this.getDstTxDataExtended(srcTxStatus, rubicId, srcHash);
    if (dstTxData.status === TX_STATUS.FAIL && srcTxStatus === TX_STATUS.PENDING) {
      srcTxStatus = TX_STATUS.FAIL;
    }

    return {
      srcTxStatus,
      dstTxStatus: dstTxData.status,
      dstTxHash: dstTxData.hash,
      ...(dstTxData.extraInfo && { extraInfo: dstTxData.extraInfo })
    };
  }

  private async getDstTxDataExtended(
    srcTxStatus: TxStatus,
    rubicId: string,
    srcHash: string
  ): Promise<TxStatusData> {
    if (srcTxStatus === TX_STATUS.FAIL) {
      return { hash: null, status: TX_STATUS.FAIL };
    }

    if (srcTxStatus === TX_STATUS.PENDING) {
      return { hash: null, status: TX_STATUS.PENDING };
    }

    const txStatusData =
      await this.sdkLegacyService.rubicApiService.fetchCrossChainTxStatusExtended(srcHash, rubicId);

    if (txStatusData.status === TX_STATUS.SUCCESS) {
      return {
        status: TX_STATUS.SUCCESS,
        hash: txStatusData.destinationTxHash
      };
    }

    if (txStatusData.status === 'REVERTED') {
      return {
        status: TX_STATUS.FALLBACK,
        hash: txStatusData.destinationTxHash
      };
    }

    if (txStatusData.status === 'NOT_FOUND' || txStatusData.status === 'LONG_PENDING') {
      return {
        status: TX_STATUS.PENDING,
        hash: null
      };
    }

    return {
      status: txStatusData.status,
      hash: txStatusData.destinationTxHash
    };
  }
}
