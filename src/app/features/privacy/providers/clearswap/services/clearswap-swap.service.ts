import { Injectable } from '@angular/core';
import { RubicApiService } from '@app/core/services/sdk/sdk-legacy/rubic-api/rubic-api.service';
import { BlockchainName, TokenAmount } from '@cryptorubic/core';

@Injectable()
export class ClearswapSwapService {
  constructor(private readonly rubicApiService: RubicApiService) {}

  public async transfer(token: TokenAmount<BlockchainName>, receiver: string): Promise<void> {
    const quoteResponse = await this.rubicApiService.quoteAllRoutes({
      srcTokenBlockchain: token.blockchain,
      srcTokenAddress: token.address,
      srcTokenAmount: token.tokenAmount.toString(),
      dstTokenBlockchain: token.blockchain,
      dstTokenAddress: token.address,
      preferredProvider: 'RUBIC_PRIVATE_TRANSFER',
      receiver
    });
    console.log(quoteResponse);
  }
}
