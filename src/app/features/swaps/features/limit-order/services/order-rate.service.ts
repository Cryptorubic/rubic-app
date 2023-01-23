import { Injectable } from '@angular/core';
import { SwapFormService } from '@app/core/services/swaps/swap-form.service';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import BigNumber from 'bignumber.js';
import { distinctUntilChanged } from 'rxjs/operators';
import { compareAssets } from '@features/swaps/shared/utils/compare-assets';
import { compareAddresses, compareTokens } from '@shared/utils/utils';
import { Token } from '@shared/models/tokens/token';
import { BLOCKCHAIN_NAME, blockchainId, EvmBlockchainName, Injector, Web3Pure } from 'rubic-sdk';
import { HttpClient } from '@angular/common/http';
import { isMinimalToken } from '@shared/utils/is-token';
import { RatePrices } from '@features/swaps/features/limit-order/services/models/rate-prices';
import { spotPriceContractAbi } from '@features/swaps/features/limit-order/services/constants/spot-price-contract-abi';
import { spotPriceContractAddress } from '@features/swaps/features/limit-order/services/constants/spot-price-contract-address';

@Injectable()
export class OrderRateService {
  private readonly _rate$ = new BehaviorSubject<BigNumber>(new BigNumber(0));

  public readonly rate$ = this._rate$.asObservable();

  constructor(
    private readonly swapFormService: SwapFormService,
    private readonly httpClient: HttpClient
  ) {
    this.subscribeOnFormChange();
  }

  private subscribeOnFormChange(): void {
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
          this._rate$.next(await this.getRate(fromAsset, toToken));
        }
      });
  }

  private async getRate(fromToken: Token, toToken: Token): Promise<BigNumber> {
    let fromTokenPrice: number | string | BigNumber;
    let toTokenPrice: number | string | BigNumber;

    ({ fromTokenPrice, toTokenPrice } = await this.getInchPrices(fromToken, toToken));
    if (!fromTokenPrice && !toTokenPrice) {
      ({ fromTokenPrice, toTokenPrice } = await this.getSpotAggregatorPrices(fromToken, toToken));
    } else if (!fromTokenPrice || !toTokenPrice) {
      if (
        fromToken.blockchain === BLOCKCHAIN_NAME.FANTOM ||
        fromToken.blockchain === BLOCKCHAIN_NAME.AURORA
      ) {
        return new BigNumber(0);
      }
      if (!fromTokenPrice) {
        fromTokenPrice = await this.getSpotAggregatorPrice(fromToken);
      } else {
        toTokenPrice = await this.getSpotAggregatorPrice(toToken);
      }
    }

    const fromPriceBn = new BigNumber(fromTokenPrice);
    const toPriceBn = new BigNumber(toTokenPrice);
    if (fromPriceBn?.isFinite() && toPriceBn?.isFinite() && toPriceBn.gt(0)) {
      return new BigNumber(fromTokenPrice).div(toTokenPrice).dp(6);
    }
    return new BigNumber(0);
  }

  private async getInchPrices(fromToken: Token, toToken: Token): Promise<RatePrices> {
    const chainId = blockchainId[fromToken.blockchain];
    const prices = await firstValueFrom(
      this.httpClient.get<{
        [address: string]: string;
      }>(`https://token-prices.1inch.io/v1.1/${chainId}`)
    );
    let fromTokenPrice: number | string = Object.entries(prices).find(([address]) =>
      compareAddresses(address, fromToken.address)
    )?.[1];
    let toTokenPrice: number | string = Object.entries(prices).find(([address]) =>
      compareAddresses(address, toToken.address)
    )?.[1];
    return { fromTokenPrice, toTokenPrice };
  }

  private async getSpotAggregatorPrices(fromToken: Token, toToken: Token): Promise<RatePrices> {
    const res = await Injector.web3PublicService
      .getWeb3Public(fromToken.blockchain as EvmBlockchainName)
      .multicallContractMethod<string>(
        spotPriceContractAddress[fromToken.blockchain as keyof typeof spotPriceContractAddress],
        spotPriceContractAbi,
        'getRateToEth',
        [
          [fromToken.address, true],
          [toToken.address, true]
        ]
      );
    return {
      fromTokenPrice: Web3Pure.fromWei(res[0].output, 18 - fromToken.decimals),
      toTokenPrice: Web3Pure.fromWei(res[1].output, 18 - toToken.decimals)
    };
  }

  private async getSpotAggregatorPrice(token: Token): Promise<BigNumber> {
    const res = await Injector.web3PublicService
      .getWeb3Public(token.blockchain as EvmBlockchainName)
      .callContractMethod<string>(
        spotPriceContractAddress[token.blockchain as keyof typeof spotPriceContractAddress],
        spotPriceContractAbi,
        'getRateToEth',

        [token.address, true]
      );
    return Web3Pure.fromWei(res, 18 - token.decimals);
  }
}
