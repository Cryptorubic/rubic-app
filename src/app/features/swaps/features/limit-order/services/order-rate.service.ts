import { Injectable } from '@angular/core';
import { SwapFormService } from '@app/core/services/swaps/swap-form.service';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import BigNumber from 'bignumber.js';
import { distinctUntilChanged } from 'rxjs/operators';
import { compareAssets } from '@features/swaps/shared/utils/compare-assets';
import { compareAddresses, compareTokens } from '@shared/utils/utils';
import { Token } from '@shared/models/tokens/token';
import { BLOCKCHAIN_NAME, blockchainId, Injector, Web3Pure } from 'rubic-sdk';
import { HttpClient } from '@angular/common/http';
import { isMinimalToken } from '@shared/utils/is-token';
import {
  RatePrices,
  RateTokenPrice
} from '@features/swaps/features/limit-order/services/models/rate-prices';
import { spotPriceContractAbi } from '@features/swaps/features/limit-order/services/constants/spot-price-contract-abi';
import { spotPriceContractAddress } from '@features/swaps/features/limit-order/services/constants/spot-price-contract-address';
import { OrderRate } from '@features/swaps/features/limit-order/services/models/order-rate';

@Injectable()
export class OrderRateService {
  private readonly _rate$ = new BehaviorSubject<OrderRate>({
    value: new BigNumber(0),
    percentDiff: 0
  });

  public readonly rate$ = this._rate$.asObservable();

  public get rateValue(): BigNumber {
    return this._rate$.getValue().value;
  }

  /**
   * Stores market rate for currently selected tokens.
   */
  private marketRate: BigNumber;

  private readonly decimalPoints = 6;

  constructor(
    private readonly swapFormService: SwapFormService,
    private readonly httpClient: HttpClient
  ) {
    this.subscribeOnTokensChange();
  }

  private subscribeOnTokensChange(): void {
    this.swapFormService.inputValueDistinct$
      .pipe(
        distinctUntilChanged(
          (prev, next) =>
            compareAssets(prev.fromAsset, next.fromAsset) &&
            compareTokens(prev.toToken, next.toToken)
        )
      )
      .subscribe(async ({ fromAsset, toToken }) => {
        if (isMinimalToken(fromAsset) && toToken) {
          this.marketRate = await this.getMarketRate(fromAsset, toToken);
          this.setRateToMarket();
        }
      });
  }

  private async getMarketRate(fromToken: Token, toToken: Token): Promise<BigNumber> {
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
    const chainId = blockchainId[fromToken.blockchain];
    const prices = await firstValueFrom(
      this.httpClient.get<{
        [address: string]: string;
      }>(`https://token-prices.1inch.io/v1.1/${chainId}`)
    );
    let fromTokenPrice = Object.entries(prices).find(([address]) =>
      compareAddresses(address, fromToken.address)
    )?.[1];
    let toTokenPrice = Object.entries(prices).find(([address]) =>
      compareAddresses(address, toToken.address)
    )?.[1];
    return { fromTokenPrice, toTokenPrice };
  }

  /**
   * Gets tokens' prices from spot aggregator contract through multicall.
   */
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

  /**
   * Updates rate with new value.
   * @param newRate Update rate.
   * @param form True, if rate is update by user through form.
   */
  public updateRate(newRate: string | BigNumber, form = false): void {
    const rate = new BigNumber(newRate).dp(this.decimalPoints);

    if (!this.marketRate?.isFinite() || this.marketRate.lte(0)) {
      this._rate$.next({
        value: rate,
        percentDiff: 0
      });
    } else {
      const percentDiff = Math.min(
        rate.minus(this.marketRate).div(this.marketRate).multipliedBy(100).dp(2).toNumber(),
        999
      );
      this._rate$.next({
        value: rate,
        percentDiff
      });
    }
    if (form) {
      this.updateToAmountByRate();
    }
  }

  public recalculateRateBySwapForm(): void {
    const { fromAmount } = this.swapFormService.inputValue;
    const { toAmount } = this.swapFormService.outputValue;
    if (fromAmount?.gt(0)) {
      this.updateRate(toAmount.div(fromAmount));
    }
  }

  public setRateToMarket(): void {
    this._rate$.next({
      value: this.marketRate.dp(this.decimalPoints),
      percentDiff: 0
    });
    this.updateToAmountByRate();
  }

  private updateToAmountByRate(): void {
    const orderRate = this.rateValue;
    const { fromAmount } = this.swapFormService.inputValue;
    this.swapFormService.outputControl.patchValue({
      toAmount: fromAmount?.isFinite() ? fromAmount.multipliedBy(orderRate) : new BigNumber(NaN)
    });
  }
}
