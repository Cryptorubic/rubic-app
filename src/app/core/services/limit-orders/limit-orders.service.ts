import { Injectable } from '@angular/core';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { LimitOrder } from '@core/services/limit-orders/models/limit-order';
import { AuthService } from '@core/services/auth/auth.service';
import { SdkService } from '@core/services/sdk/sdk.service';
import { TokensService } from '@core/services/tokens/tokens.service';
import { first } from 'rxjs/operators';
import {
  BLOCKCHAIN_NAME,
  blockchainId,
  CHAIN_TYPE,
  EvmBlockchainName,
  Injector,
  Web3Pure,
  Cache
} from 'rubic-sdk';
import {
  ChainId,
  limirOrderProtocolAdresses,
  LimitOrderProtocolFacade,
  Web3ProviderConnector
} from '@1inch/limit-order-protocol-utils';
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

@Injectable()
export class LimitOrdersService {
  private readonly _orders$ = new BehaviorSubject<LimitOrder[]>([]);

  public readonly orders$ = this._orders$.asObservable();

  private readonly _loading$ = new BehaviorSubject(false);

  public readonly loading$ = this._loading$.asObservable();

  /**
   * Set to true by default and after orders list was changed.
   * Set to false after update.
   * @private
   */
  private dirtyState = true;

  constructor(
    private readonly authService: AuthService,
    private readonly sdkService: SdkService,
    private readonly tokensService: TokensService,
    private readonly swapFormService: SwapFormService,
    private readonly httpClient: HttpClient
  ) {}

  public async shouldUpdateOrders(): Promise<void> {
    if (this.dirtyState) {
      await this.updateOrders();
    }
  }

  private async updateOrders(): Promise<void> {
    const walletAddress = this.authService.userAddress;
    if (!walletAddress) {
      return;
    }

    this._loading$.next(true);
    this._orders$.next(await this.getUserTrades(walletAddress));
    this._loading$.next(false);
    this.dirtyState = false;
  }

  private async getUserTrades(walletAddress: string): Promise<LimitOrder[]> {
    const orders = await this.sdkService.limitOrderManager.getUserTrades(walletAddress);
    await firstValueFrom(this.tokensService.tokens$.pipe(first(v => Boolean(v))));
    return Promise.all(
      orders.map(async order => {
        const [fromToken, toToken] = await Promise.all([
          this.tokensService.findToken(order.fromToken, true),
          this.tokensService.findToken(order.toToken, true)
        ]);
        const marketRate = await this.getMarketRate(fromToken, toToken);
        const orderRate = new BigNumber(order.toAmount).div(order.fromAmount);

        return {
          ...order,
          fromToken,
          toToken,
          marketRate,
          orderRate
        };
      })
    );
  }

  public setDirty(): void {
    this.dirtyState = true;
  }

  public async cancelOrder(blockchain: EvmBlockchainName, orderHash: string): Promise<void> {
    await this.sdkService.limitOrderManager.cancelOrder(blockchain, orderHash);
    const updatedOrders = this._orders$.value.filter(({ hash }) => hash === orderHash);
    this._orders$.next(updatedOrders);
  }

  public async fillOrder(token: Token, orderHash: string): Promise<void> {
    const blockchain = token.blockchain as EvmBlockchainName;
    const order = await this.sdkService.limitOrderManager['apiService'].getOrderByHash(
      this.authService.userAddress,
      blockchain,
      orderHash
    );

    const chainId = blockchainId[blockchain] as ChainId;
    const connector = new Web3ProviderConnector(
      Injector.web3PrivateService.getWeb3Private(CHAIN_TYPE.EVM).web3
    );
    const limitOrderProtocolFacade = new LimitOrderProtocolFacade(
      limirOrderProtocolAdresses[chainId],
      chainId,
      connector
    );

    const { fromAmount } = this.swapFormService.inputValue;
    const data = limitOrderProtocolFacade.fillLimitOrder({
      order: order.data,
      signature: order.signature,
      makingAmount: '0',
      takingAmount: Web3Pure.toWei(fromAmount, token.decimals),
      thresholdAmount: '0'
    });
    await Injector.web3PrivateService
      .getWeb3Private(CHAIN_TYPE.EVM)
      .sendTransaction(limirOrderProtocolAdresses[chainId], {
        data
      });
  }

  public async getMarketRate(fromToken: Token, toToken: Token): Promise<BigNumber> {
    let fromTokenPrice: number | string | BigNumber;
    let toTokenPrice: number | string | BigNumber;

    ({ fromTokenPrice, toTokenPrice } = await this.getInchPrices(fromToken, toToken));
    if (!fromTokenPrice && !toTokenPrice) {
      [fromTokenPrice, toTokenPrice] = await this.getSpotAggregatorPrices([fromToken, toToken]);
    } else if (!fromTokenPrice || !toTokenPrice) {
      if (
        fromToken.blockchain === BLOCKCHAIN_NAME.FANTOM ||
        fromToken.blockchain === BLOCKCHAIN_NAME.AURORA
      ) {
        return new BigNumber(0);
      }
      if (!fromTokenPrice) {
        [fromTokenPrice] = await this.getSpotAggregatorPrices([fromToken]);
      } else {
        [toTokenPrice] = await this.getSpotAggregatorPrices([toToken]);
      }
    }

    const fromPriceBn = new BigNumber(fromTokenPrice);
    const toPriceBn = new BigNumber(toTokenPrice);
    if (fromPriceBn?.isFinite() && toPriceBn?.isFinite() && toPriceBn.gt(0)) {
      return new BigNumber(fromTokenPrice).div(toTokenPrice);
    }
    return new BigNumber(0);
  }

  /**
   * Gets tokens' prices from 1inch api.
   */
  private async getInchPrices(fromToken: Token, toToken: Token): Promise<RatePrices> {
    const prices = await this.getInchAllPrices(blockchainId[fromToken.blockchain]);
    let fromTokenPrice = Object.entries(prices).find(([address]) =>
      compareAddresses(address, fromToken.address)
    )?.[1];
    let toTokenPrice = Object.entries(prices).find(([address]) =>
      compareAddresses(address, toToken.address)
    )?.[1];
    return { fromTokenPrice, toTokenPrice };
  }

  @Cache({
    maxAge: 15_000
  })
  private getInchAllPrices(chainId: number): Promise<Record<string, string>> {
    return firstValueFrom(
      this.httpClient.get<Record<string, string>>(`https://token-prices.1inch.io/v1.1/${chainId}`)
    );
  }

  /**
   * Gets tokens' prices from spot aggregator contract through multicall.
   */
  @Cache({
    maxAge: 15_000
  })
  private async getSpotAggregatorPrices(tokens: Token[]): Promise<RateTokenPrice[]> {
    if (!tokens.length) {
      return [];
    }
    const blockchain = tokens[0].blockchain as keyof typeof spotPriceContractAddress;
    const methodArguments = tokens.map(token => [token.address, true]);
    const res = await Injector.web3PublicService
      .getWeb3Public(blockchain)
      .multicallContractMethod<string>(
        spotPriceContractAddress[blockchain],
        spotPriceContractAbi,
        'getRateToEth',
        methodArguments
      );
    return res.map((tokenPrice, index) => {
      if (tokenPrice.success) {
        return Web3Pure.fromWei(tokenPrice.output, 18 - tokens[index].decimals);
      }
      return new BigNumber(0);
    });
  }
}
