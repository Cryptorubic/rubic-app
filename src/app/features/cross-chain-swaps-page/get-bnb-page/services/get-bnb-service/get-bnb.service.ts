import { Injectable } from '@angular/core';
import { HttpService } from 'src/app/core/services/http/http.service';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { GetBnbTrade } from 'src/app/features/cross-chain-swaps-page/get-bnb-page/models/GetBnbTrade';
import { Web3PublicService } from 'src/app/core/services/blockchain/web3-public-service/web3-public.service';

interface EstimatedAmountResponse {
  from_amount: number;
  to_amount: number;
}

@Injectable()
export class GetBnbService {
  private readonly baseApiUrl = 'https://devbnbexchange.mywish.io/api/v1/';

  constructor(private httpService: HttpService) {}

  public getEstimatedAmounts(trade: GetBnbTrade): Observable<GetBnbTrade> {
    return this.httpService
      .get(`estimate_amount/${trade.fromToken.symbol}`, {}, this.baseApiUrl)
      .pipe(
        map((response: EstimatedAmountResponse) => ({
          ...trade,
          fromAmount: Web3PublicService.tokenWeiToAmount(
            trade.fromToken,
            response.from_amount.toString()
          ).toFixed(),
          toAmount: Web3PublicService.tokenWeiToAmount(
            trade.toToken,
            response.to_amount.toString()
          ).toFixed()
        }))
      );
  }
}
