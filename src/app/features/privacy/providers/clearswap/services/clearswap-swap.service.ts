import { Injectable } from '@angular/core';
import { TransactionFailedError } from '@app/core/errors/models/common/transaction-failed-error';
import { ERROR_TYPE } from '@app/core/errors/models/error-type';
import { RubicError } from '@app/core/errors/models/rubic-error';
import { NotificationsService } from '@app/core/services/notifications/notifications.service';
import { RubicApiService } from '@app/core/services/sdk/sdk-legacy/rubic-api/rubic-api.service';
import { SdkLegacyService } from '@app/core/services/sdk/sdk-legacy/sdk-legacy.service';
import { CLEARSWAP_STATUS } from '@app/features/privacy/providers/clearswap/models/status';
import { OnChainApiService } from '@app/features/trade/services/on-chain-api/on-chain-api.service';
import { Token } from '@app/shared/models/tokens/token';
import { BLOCKCHAIN_NAME, BlockchainName, ErrorInterface, TokenAmount } from '@cryptorubic/core';
import { RubicSdkError, TronAdapter, TX_STATUS } from '@cryptorubic/web3';
import BigNumber from 'bignumber.js';
import {
  timer,
  defer,
  retry,
  throwError,
  lastValueFrom,
  catchError,
  combineLatest,
  from,
  of,
  switchMap,
  takeWhile
} from 'rxjs';

@Injectable()
export class ClearswapSwapService {
  public get chainAdapter(): TronAdapter {
    return this.sdkLegacyService.adaptersFactoryService.getAdapter(BLOCKCHAIN_NAME.TRON);
  }

  constructor(
    private readonly rubicApiService: RubicApiService,
    private readonly sdkLegacyService: SdkLegacyService,
    private readonly notificationsService: NotificationsService,
    private readonly onChainApiService: OnChainApiService
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
      const swapResponse = await lastValueFrom(
        defer(() =>
          this.rubicApiService.fetchSwapData<{ depositAddress: string }>({
            id,
            srcTokenBlockchain: fromToken.blockchain,
            srcTokenAddress: fromToken.address,
            srcTokenAmount: fromToken.tokenAmount.toString(),
            dstTokenBlockchain: toToken.blockchain,
            dstTokenAddress: toToken.address,
            preferredProvider: 'CLEARSWAP',
            receiver
          })
        ).pipe(
          retry({
            count: 5,
            delay: (error, retryCount) => {
              console.error('swap error:', error, 'retry #', retryCount);
              if (error?.message?.includes('Cannot retrieve information about')) {
                return timer(5000);
              }
              return throwError(() => error);
            }
          })
        )
      );
      const depositAddress = swapResponse.transaction.depositAddress;

      const txHash = await lastValueFrom(
        defer(() =>
          this.chainAdapter.signer.transfer({
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
          })
        ).pipe(
          retry({
            count: 5,
            delay: (error, retryCount) => {
              console.error('sign error:', error, 'retry #', retryCount);
              if (error?.message?.includes('AxiosError: Network Error')) {
                return timer(5000);
              }
              return throwError(() => error);
            }
          })
        )
      );

      const [apiResponse, txStatus] = await lastValueFrom(
        timer(5_000, 30_000).pipe(
          switchMap(() =>
            combineLatest([
              this.onChainApiService.getClearswapStatus(id),
              from(this.chainAdapter.getTransactionStatus(txHash)).pipe(
                catchError(() => {
                  return of(TX_STATUS.PENDING);
                })
              )
            ])
          ),
          takeWhile(
            ([apiResponseVal, txStatusVal]) =>
              !(
                apiResponseVal.status === CLEARSWAP_STATUS.SUCCESS ||
                apiResponseVal.status === CLEARSWAP_STATUS.FAIL ||
                txStatusVal === TX_STATUS.FAIL
              ),
            true
          )
        )
      );
      if (apiResponse.status === CLEARSWAP_STATUS.SUCCESS) {
        this.notificationsService.showSuccess('The operation was successful.');
      } else {
        if (txStatus === TX_STATUS.FAIL) {
          throw new TransactionFailedError(BLOCKCHAIN_NAME.TRON, txHash);
        }
        throw new RubicError<ERROR_TYPE.TEXT>(`The operation has failed.`);
      }
    } catch (error) {
      if (error instanceof RubicError || error instanceof RubicSdkError) {
        throw error;
      }
      throw new RubicError<ERROR_TYPE.TEXT>('Something went wrong. Please, try again later.');
    }
  }
}
