import { Injectable } from '@angular/core';
import { NotificationsService } from '@app/core/services/notifications/notifications.service';
import { RubicApiService } from '@app/core/services/sdk/sdk-legacy/rubic-api/rubic-api.service';
import { SdkLegacyService } from '@app/core/services/sdk/sdk-legacy/sdk-legacy.service';
import { CLEARSWAP_STATUS } from '@app/features/privacy/providers/clearswap/models/status';
import { Token } from '@app/shared/models/tokens/token';
import { BLOCKCHAIN_NAME, BlockchainName, ErrorInterface, TokenAmount } from '@cryptorubic/core';
import { TronAdapter } from '@cryptorubic/web3';
import BigNumber from 'bignumber.js';
import { lastValueFrom, timer, switchMap, takeWhile } from 'rxjs';

@Injectable()
export class ClearswapSwapService {
  private get chainAdapter(): TronAdapter {
    return this.sdkLegacyService.adaptersFactoryService.getAdapter(BLOCKCHAIN_NAME.TRON);
  }

  constructor(
    private readonly rubicApiService: RubicApiService,
    private readonly sdkLegacyService: SdkLegacyService,
    private readonly notificationsService: NotificationsService
  ) {}

  public async quote(
    fromToken: TokenAmount<BlockchainName>,
    toToken: Token,
    receiver: string
  ): Promise<
    | {
        tradeId: string;
        tokenAmount: string;
        tokenAmountWei: BigNumber;
      }
    | { tradeError: ErrorInterface }
  > {
    const quoteResponse = await this.rubicApiService.quoteAllRoutes({
      srcTokenBlockchain: fromToken.blockchain,
      srcTokenAddress: fromToken.address,
      srcTokenAmount: fromToken.tokenAmount.toString(),
      dstTokenBlockchain: toToken.blockchain,
      dstTokenAddress: toToken.address,
      preferredProvider: 'CLEARSWAP',
      receiver,
      showDangerousRoutes: true,
      showFailedRoutes: true
    });
    const route = quoteResponse.routes[0];
    if (route) {
      return {
        tradeId: route.id,
        tokenAmount: route.estimate.destinationTokenAmount,
        tokenAmountWei: new BigNumber(route.estimate.destinationWeiAmount)
      };
    }

    const failed = quoteResponse.failed[0];
    return {
      tradeError: failed.data
    };
  }

  public async transfer(
    id: string,
    fromToken: TokenAmount<BlockchainName>,
    toToken: Token,
    receiver: string
  ): Promise<void> {
    try {
      const swapResponse = await this.rubicApiService.fetchSwapData<{ depositAddress: string }>({
        id,
        srcTokenBlockchain: fromToken.blockchain,
        srcTokenAddress: fromToken.address,
        srcTokenAmount: fromToken.tokenAmount.toString(),
        dstTokenBlockchain: toToken.blockchain,
        dstTokenAddress: toToken.address,
        preferredProvider: 'CLEARSWAP',
        receiver
      });
      const depositAddress = swapResponse.transaction.depositAddress;

      await this.chainAdapter.signer.transfer({
        receiver: depositAddress,
        tokenWeiAmount: fromToken.stringWeiAmount,
        tokenAddress: fromToken.address,
        txOptions: {
          onTransactionHash: () => {
            this.notificationsService.showInfo(
              'Transaction has started. Please wait 3–5 minutes until the operation is complete.'
            );
          }
        }
      });

      const { status } = await lastValueFrom(
        timer(30_000, 30_000).pipe(
          switchMap(() => this.rubicApiService.getClearswapStatus(id)),
          takeWhile(
            res => res.status !== CLEARSWAP_STATUS.SUCCESS && res.status !== CLEARSWAP_STATUS.FAIL,
            true
          )
        )
      );
      if (status === CLEARSWAP_STATUS.SUCCESS) {
        this.notificationsService.showSuccess('The operation was successful.');
      } else {
        this.notificationsService.showError('The operation has failed.');
      }
    } catch (err) {
      console.error(err);
    }
  }
}
