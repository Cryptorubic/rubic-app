import { Injectable } from '@angular/core';
import { CryptoTapTrade } from 'src/app/features/cross-chain-swaps-page/crypto-tap-page/models/CryptoTapTrade';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { HttpService } from 'src/app/core/services/http/http.service';
import { BOT_URL } from 'src/app/core/services/backend/constants/BOT_URL';

@Injectable({
  providedIn: 'root'
})
export class CryptoTapApiService {
  constructor(private httpService: HttpService) {}

  public notifyCryptoTapBot(
    trade: CryptoTapTrade,
    transactionHash: string,
    walletAddress: string
  ): Promise<void> {
    const data = {
      transactionHash,
      walletAddress,
      fromAmount: trade.fromToken.fromAmount,
      toAmount: trade.fromToken.toAmount,
      toBlockchain: BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN,
      fromTokenSymbol: trade.fromToken.symbol,
      fromTokenPrice: trade.fromToken.price
    };

    return this.httpService.post(BOT_URL.GET_BNB, data).toPromise();
  }
}
