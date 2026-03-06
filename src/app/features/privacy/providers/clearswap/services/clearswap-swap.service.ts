import { Injectable } from '@angular/core';
import { RubicApiService } from '@app/core/services/sdk/sdk-legacy/rubic-api/rubic-api.service';
import { SdkLegacyService } from '@app/core/services/sdk/sdk-legacy/sdk-legacy.service';
import { BLOCKCHAIN_NAME, BlockchainName, TokenAmount } from '@cryptorubic/core';
import { TronAdapter } from '@cryptorubic/web3';

@Injectable()
export class ClearswapSwapService {
  private get chainAdapter(): TronAdapter {
    return this.sdkLegacyService.adaptersFactoryService.getAdapter(BLOCKCHAIN_NAME.TRON);
  }

  constructor(
    private readonly rubicApiService: RubicApiService,
    private readonly sdkLegacyService: SdkLegacyService
  ) {}

  public async quote(
    token: TokenAmount<BlockchainName>,
    receiver: string
  ): Promise<{
    tradeId: string;
    tokenAmount: string;
  }> {
    try {
      const quoteResponse = await this.rubicApiService.quoteAllRoutes({
        srcTokenBlockchain: token.blockchain,
        srcTokenAddress: token.address,
        srcTokenAmount: token.tokenAmount.toString(),
        dstTokenBlockchain: token.blockchain,
        dstTokenAddress: token.address,
        preferredProvider: 'CLEARSWAP',
        receiver,
        showDangerousRoutes: true
      });
      const route = quoteResponse.routes[0];
      return {
        tradeId: route.id,
        tokenAmount: route.estimate.destinationTokenAmount
      };
    } catch (err) {
      console.error(err);
    }
  }

  public async transfer(
    id: string,
    token: TokenAmount<BlockchainName>,
    receiver: string
  ): Promise<void> {
    try {
      const swapResponse = await this.rubicApiService.fetchSwapData<{ depositAddress: string }>({
        id,
        srcTokenBlockchain: token.blockchain,
        srcTokenAddress: token.address,
        srcTokenAmount: token.tokenAmount.toString(),
        dstTokenBlockchain: token.blockchain,
        dstTokenAddress: token.address,
        preferredProvider: 'CLEARSWAP',
        receiver
      });
      const depositAddress = swapResponse.transaction.depositAddress;

      await this.chainAdapter.signer.transfer({
        receiver: depositAddress,
        tokenWeiAmount: token.stringWeiAmount,
        tokenAddress: token.address,
        txOptions: {}
      });
    } catch (err) {
      console.error(err);
    }
  }
}
