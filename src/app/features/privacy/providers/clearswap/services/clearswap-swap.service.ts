import { Injectable } from '@angular/core';
import { RubicApiService } from '@app/core/services/sdk/sdk-legacy/rubic-api/rubic-api.service';
import { SdkLegacyService } from '@app/core/services/sdk/sdk-legacy/sdk-legacy.service';
import { Token } from '@app/shared/models/tokens/token';
import { BLOCKCHAIN_NAME, BlockchainName, TokenAmount } from '@cryptorubic/core';
import { TronAdapter } from '@cryptorubic/web3';
import BigNumber from 'bignumber.js';

@Injectable()
export class ClearswapSwapService {
  private get chainAdapter(): TronAdapter {
    return this.sdkLegacyService.adaptersFactoryService.getAdapter(BLOCKCHAIN_NAME.TRON);
  }

  constructor(
    private readonly rubicApiService: RubicApiService,
    private readonly sdkLegacyService: SdkLegacyService
  ) {}

  // public async checkStatus(): Promise<void> {
  //   await firstValueFrom(
  //     this.sdkLegacyService.httpClient.get(
  //       'https://dev-api.rubic.exchange/api/v3/tmp/statuses/clearswap/status?rubic_id=29677fe8-3957-4477-95cf-d11c9bc60326'
  //     )
  //   );
  // }

  public async quote(
    fromToken: TokenAmount<BlockchainName>,
    toToken: Token,
    receiver: string
  ): Promise<{
    tradeId: string;
    tokenAmount: string;
    tokenAmountWei: BigNumber;
  }> {
    try {
      const quoteResponse = await this.rubicApiService.quoteAllRoutes({
        srcTokenBlockchain: fromToken.blockchain,
        srcTokenAddress: fromToken.address,
        srcTokenAmount: fromToken.tokenAmount.toString(),
        dstTokenBlockchain: toToken.blockchain,
        dstTokenAddress: toToken.address,
        preferredProvider: 'CLEARSWAP',
        receiver,
        showDangerousRoutes: true
      });
      const route = quoteResponse.routes[0];
      return {
        tradeId: route.id,
        tokenAmount: route.estimate.destinationTokenAmount,
        tokenAmountWei: new BigNumber(route.estimate.destinationWeiAmount)
      };
    } catch (err) {
      console.error(err);
    }
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
        txOptions: {}
      });
    } catch (err) {
      console.error(err);
    }
  }
}
