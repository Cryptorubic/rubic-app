import { Injectable } from '@angular/core';
import { HttpService } from 'src/app/core/services/http/http.service';
import { BOT_URL } from 'src/app/core/services/backend/constants/BOT_URL';
import { TokenAmount } from 'src/app/shared/models/tokens/TokenAmount';

@Injectable({
  providedIn: 'root'
})
export class CryptoTapApiService {
  constructor(private httpService: HttpService) {}

  public notifyCryptoTapBot(parameters: {
    fromToken: TokenAmount;
    toToken: TokenAmount;
    fromAmount: string;
    toAmount: string;
    transactionHash: string;
    walletAddress: string;
  }): Promise<void> {
    const data = {
      transactionHash: parameters.transactionHash,
      walletAddress: parameters.walletAddress,
      fromAmount: parameters.fromAmount,
      toAmount: parameters.toAmount,
      toBlockchain: parameters.toToken.blockchain,
      fromTokenSymbol: parameters.fromToken.symbol,
      fromTokenPrice: parameters.fromToken.price
    };

    return this.httpService.post(BOT_URL.CRYPTO_TAP, data).toPromise();
  }
}
