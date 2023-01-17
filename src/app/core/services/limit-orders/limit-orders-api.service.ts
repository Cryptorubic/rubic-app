import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { LimitOrder } from '@core/services/limit-orders/models/limit-order';
import { LimitOrderApiResponse } from '@core/services/limit-orders/models/limit-order-api';
import { LIMIT_ORDER_STATUS } from '@core/limit-orders/models/limit-order-status';
import { TokensService } from '@core/services/tokens/tokens.service';
import { blockchainId, BlockchainName, limitOrderSupportedBlockchains, Web3Pure } from 'rubic-sdk';
import { firstValueFrom } from 'rxjs';
import { first } from 'rxjs/operators';

@Injectable()
export class LimitOrdersApiService {
  constructor(
    private readonly httpClient: HttpClient,
    private readonly tokensService: TokensService
  ) {}

  public async getUserOrders(userAddress: string): Promise<LimitOrder[]> {
    const orders = (
      await Promise.all(
        limitOrderSupportedBlockchains.map(async blockchain => {
          const id = blockchainId[blockchain];
          const ordersById = await firstValueFrom(
            this.httpClient.get<LimitOrderApiResponse[]>(
              `https://limit-orders.1inch.io/v3.0/${id}/limit-order/address/${userAddress}?page=1&limit=100&statuses=%5B1,2%5D&sortBy=createDateTime`
            )
          );
          return Promise.all(
            ordersById.map(orderById => this.parseLimitOrder(blockchain, orderById))
          );
        })
      )
    ).flat();
    orders.sort((orderA, orderB) => {
      if (orderA.status === orderB.status) {
        return orderB.creation.getTime() - orderA.creation.getTime();
      }
      if (orderA.status === LIMIT_ORDER_STATUS.INVALID) {
        return 1;
      }
      return -1;
    });
    return orders;
  }

  private async parseLimitOrder(
    blockchain: BlockchainName,
    {
      createDateTime,
      data: { makerAsset, takerAsset, makingAmount, takingAmount },
      orderInvalidReason
    }: LimitOrderApiResponse
  ): Promise<LimitOrder> {
    await firstValueFrom(this.tokensService.tokens$.pipe(first(v => Boolean(v?.size))));
    const [fromToken, toToken] = await Promise.all([
      this.tokensService.findToken({ blockchain, address: makerAsset }, true),
      this.tokensService.findToken({ blockchain, address: takerAsset }, true)
    ]);
    return {
      creation: new Date(createDateTime),
      fromToken,
      toToken,
      fromAmount: Web3Pure.fromWei(makingAmount, fromToken?.decimals),
      toAmount: Web3Pure.fromWei(takingAmount, toToken?.decimals),
      expiration: new Date(createDateTime),
      status: orderInvalidReason === null ? LIMIT_ORDER_STATUS.VALID : LIMIT_ORDER_STATUS.INVALID
    };
  }
}
