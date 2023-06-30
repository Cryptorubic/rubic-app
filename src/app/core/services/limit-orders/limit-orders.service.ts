import { Injectable } from '@angular/core';
import { BehaviorSubject, firstValueFrom, from, Observable, of, Subscription } from 'rxjs';
import { LimitOrder } from '@core/services/limit-orders/models/limit-order';
import { AuthService } from '@core/services/auth/auth.service';
import { SdkService } from '@core/services/sdk/sdk.service';
import { TokensService } from '@core/services/tokens/tokens.service';
import { first, map } from 'rxjs/operators';
import {
  BLOCKCHAIN_NAME,
  blockchainId,
  EvmBlockchainName,
  Injector,
  Web3Pure,
  CROSS_CHAIN_TRADE_TYPE
} from 'rubic-sdk';

import { SwapFormService } from '@core/services/swaps/swap-form.service';
import { Token } from '@app/shared/models/tokens/token';
import BigNumber from 'bignumber.js';
import {
  RatePrices,
  RateTokenPrice
} from '@features/swaps/features/limit-order/services/models/rate-prices';
import { compareAddresses } from '@shared/utils/utils';
import { spotPriceContractAddress } from '@features/swaps/features/limit-order/services/constants/spot-price-contract-address';
import { spotPriceContractAbi } from '@features/swaps/features/limit-order/services/constants/spot-price-contract-abi';
import { HttpClient } from '@angular/common/http';
import { SuccessTxModalService } from '@core/services/success-tx-modal-service/success-tx-modal.service';
import { PolymorpheusComponent } from '@tinkoff/ng-polymorpheus';
import { ProgressTrxNotificationComponent } from '@shared/components/progress-trx-notification/progress-trx-notification.component';
import { TuiNotification } from '@taiga-ui/core';
import { NotificationsService } from '@core/services/notifications/notifications.service';
import { SuccessTrxNotificationComponent } from '@shared/components/success-trx-notification/success-trx-notification.component';
import { TokensStoreService } from '@core/services/tokens/tokens-store.service';
import { GasService } from '@core/services/gas-service/gas.service';
import { Cacheable } from 'ts-cacheable';

@Injectable()
export class LimitOrdersService {
  private readonly _orders$ = new BehaviorSubject<LimitOrder[]>([]);

  public readonly orders$ = this._orders$.asObservable();

  private readonly _loading$ = new BehaviorSubject(false);

  public readonly loading$ = this._loading$.asObservable();

  public get loading(): boolean {
    return this._loading$.getValue();
  }

  constructor(
    private readonly authService: AuthService,
    private readonly sdkService: SdkService,
    private readonly tokensService: TokensService,
    private readonly tokensStoreService: TokensStoreService,
    private readonly swapFormService: SwapFormService,
    private readonly httpClient: HttpClient,
    private readonly successTxModalService: SuccessTxModalService,
    private readonly notificationsService: NotificationsService,
    private readonly gasService: GasService
  ) {}

  public async updateOrders(): Promise<void> {
    const walletAddress = this.authService.userAddress;
    if (!walletAddress) {
      this._orders$.next([]);
      return;
    }

    this._loading$.next(true);
    this._orders$.next(await this.getUserTrades(walletAddress));
    this._loading$.next(false);
  }

  private async getUserTrades(walletAddress: string): Promise<LimitOrder[]> {
    const orders = await this.sdkService.limitOrderManager.getUserTrades(walletAddress);
    await firstValueFrom(this.tokensStoreService.tokens$.pipe(first(v => Boolean(v))));
    return Promise.all(
      orders.map(async order => {
        const [fromToken, toToken] = await Promise.all([
          this.tokensService.findToken(order.fromToken, true),
          this.tokensService.findToken(order.toToken, true)
        ]);
        const marketRate = await this.getMarketRate(fromToken, toToken);
        const orderRate = new BigNumber(order.toAmount).div(order.fromAmount);

        const minutesAfterCreation = Math.floor((Date.now() - order.creation.getTime()) / 60_000);
        let fromBalance = order.fromBalance;
        if (minutesAfterCreation < 1 && order.fromBalance.eq(0)) {
          fromBalance = await this.tokensService.getAndUpdateTokenBalance(fromToken);
        }

        return {
          ...order,
          fromToken,
          toToken,
          marketRate,
          orderRate,
          fromBalance
        };
      })
    );
  }

  public async cancelOrder(blockchain: EvmBlockchainName, orderHash: string): Promise<void> {
    let subscription$: Subscription;
    const onConfirm = (hash: string) => {
      subscription$ = this.successTxModalService.open(
        hash,
        blockchain,
        'on-chain',
        CROSS_CHAIN_TRADE_TYPE.CELER,
        () =>
          this.notificationsService.showWithoutSubscribe(
            new PolymorpheusComponent(ProgressTrxNotificationComponent),
            {
              status: TuiNotification.Info,
              autoClose: false,
              data: null
            }
          )
      );
    };

    try {
      const { shouldCalculateGasPrice, gasPriceOptions } = await this.gasService.getGasInfo(
        blockchain
      );

      await this.sdkService.limitOrderManager.cancelOrder(blockchain, orderHash, {
        onConfirm,
        ...(shouldCalculateGasPrice && { gasPriceOptions })
      });

      subscription$.unsubscribe();
      this.notificationsService.show(new PolymorpheusComponent(SuccessTrxNotificationComponent), {
        status: TuiNotification.Success,
        autoClose: 15000,
        data: {
          type: 'on-chain',
          withRecentTrades: false
        }
      });
    } finally {
      subscription$?.unsubscribe();
    }

    const updatedOrders = this._orders$.value.filter(({ hash }) => hash !== orderHash);
    this._orders$.next(updatedOrders);
  }

  public async getMarketRate(fromToken: Token, toToken: Token): Promise<BigNumber> {
    let fromTokenPrice: number | string | BigNumber;
    let toTokenPrice: number | string | BigNumber;

    ({ fromTokenPrice, toTokenPrice } = await this.getInchPrices(fromToken, toToken));
    if (!fromTokenPrice && !toTokenPrice) {
      [fromTokenPrice, toTokenPrice] = await firstValueFrom(
        this.getSpotAggregatorPrices([fromToken, toToken])
      );
    } else if (!fromTokenPrice || !toTokenPrice) {
      if (
        fromToken.blockchain === BLOCKCHAIN_NAME.FANTOM ||
        fromToken.blockchain === BLOCKCHAIN_NAME.AURORA
      ) {
        return new BigNumber(NaN);
      }
      if (!fromTokenPrice) {
        [fromTokenPrice] = await firstValueFrom(this.getSpotAggregatorPrices([fromToken]));
      } else {
        [toTokenPrice] = await firstValueFrom(this.getSpotAggregatorPrices([toToken]));
      }
    }

    const fromPriceBn = new BigNumber(fromTokenPrice);
    const toPriceBn = new BigNumber(toTokenPrice);
    if (fromPriceBn?.isFinite() && toPriceBn?.isFinite() && toPriceBn.gt(0)) {
      return new BigNumber(fromTokenPrice).div(toTokenPrice);
    }
    return new BigNumber(NaN);
  }

  /**
   * Gets tokens' prices from 1inch api.
   */
  private async getInchPrices(fromToken: Token, toToken: Token): Promise<RatePrices> {
    const prices = await firstValueFrom(this.getInchAllPrices(blockchainId[fromToken.blockchain]));
    let fromTokenPrice = Object.entries(prices).find(([address]) =>
      compareAddresses(address, fromToken.address)
    )?.[1];
    let toTokenPrice = Object.entries(prices).find(([address]) =>
      compareAddresses(address, toToken.address)
    )?.[1];
    return { fromTokenPrice, toTokenPrice };
  }

  @Cacheable({
    maxAge: 15_000
  })
  private getInchAllPrices(chainId: number): Observable<Record<string, string>> {
    return this.httpClient.get<Record<string, string>>(
      `https://token-prices.1inch.io/v1.1/${chainId}`
    );
  }

  /**
   * Gets tokens' prices from spot aggregator contract through multicall.
   */
  @Cacheable({
    maxAge: 15_000
  })
  private getSpotAggregatorPrices(tokens: Token[]): Observable<RateTokenPrice[]> {
    if (!tokens.length) {
      return of([]);
    }
    const blockchain = tokens[0].blockchain as keyof typeof spotPriceContractAddress;
    const methodArguments = tokens.map(token => [token.address, true]);
    from(
      Injector.web3PublicService
        .getWeb3Public(blockchain)
        .multicallContractMethod<string>(
          spotPriceContractAddress[blockchain],
          spotPriceContractAbi,
          'getRateToEth',
          methodArguments
        )
    ).pipe(
      map(res => {
        return res.map((tokenPrice, index) => {
          if (tokenPrice.success) {
            return Web3Pure.fromWei(tokenPrice.output, 18 - tokens[index].decimals);
          }
          return new BigNumber(0);
        });
      })
    );
  }
}
