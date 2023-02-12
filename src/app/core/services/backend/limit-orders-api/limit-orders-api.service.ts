import { Injectable } from '@angular/core';
import { TO_BACKEND_BLOCKCHAINS } from '@shared/constants/blockchain/backend-blockchains';
import { HttpService } from '../../http/http.service';
import { Web3Pure } from 'rubic-sdk';
import { SwapFormInput } from '@core/services/swaps/models/swap-form-controls';
import { Token } from '@shared/models/tokens/token';
import BigNumber from 'bignumber.js';
import { LimitOrderApiInfo } from '@core/services/backend/limit-orders-api/models/limit-order-api-info';

@Injectable({
  providedIn: 'root'
})
export class LimitOrdersApiService {
  constructor(private readonly httpService: HttpService) {}

  /**
   * Sends request to add trade.
   */
  public createTrade(
    hash: string,
    form: SwapFormInput,
    toAmount: BigNumber,
    userAddress: string
  ): void {
    const { fromAsset, toToken, fromAmount } = form;
    const fromToken = fromAsset as Token;
    const orderInfo: LimitOrderApiInfo = {
      hash,
      network: TO_BACKEND_BLOCKCHAINS[fromToken.blockchain],
      from_token: fromToken.address,
      to_token: toToken.address,
      from_amount: Web3Pure.toWei(fromAmount, fromToken.decimals),
      to_amount: Web3Pure.toWei(toAmount, toToken.decimals),
      user: userAddress,
      provider: 'oneinch'
    };

    this.httpService.post('limit_orders/limit_order', orderInfo).subscribe();
  }
}
