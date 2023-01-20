import { Injectable } from '@angular/core';
import { SwapFormService } from '@app/core/services/swaps/swap-form.service';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import BigNumber from 'bignumber.js';
import { distinctUntilChanged } from 'rxjs/operators';
import { compareAssets } from '@features/swaps/shared/utils/compare-assets';
import { compareAddresses, compareTokens } from '@shared/utils/utils';
import { Token } from '@shared/models/tokens/token';
import { blockchainId } from 'rubic-sdk';
import { HttpClient } from '@angular/common/http';
import { isMinimalToken } from '@shared/utils/is-token';
import { CoingeckoApiService } from '@core/services/external-api/coingecko-api/coingecko-api.service';

@Injectable()
export class OrderRateService {
  private readonly _rate$ = new BehaviorSubject<BigNumber>(new BigNumber(0));

  public readonly rate$ = this._rate$.asObservable();

  constructor(
    private readonly swapFormService: SwapFormService,
    private readonly httpClient: HttpClient,
    private readonly coingeckoApiService: CoingeckoApiService
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
    if (fromTokenPrice && toTokenPrice) {
      return new BigNumber(fromTokenPrice).div(toTokenPrice).dp(6);
    }

    [fromTokenPrice, toTokenPrice] = await Promise.all([
      firstValueFrom(
        this.coingeckoApiService.getCommonTokenPrice(fromToken.blockchain, fromToken.address)
      ),
      firstValueFrom(
        this.coingeckoApiService.getCommonTokenPrice(toToken.blockchain, toToken.address)
      )
    ]);
    if (fromTokenPrice && toTokenPrice) {
      return new BigNumber(fromTokenPrice).div(toTokenPrice).dp(6);
    }
  }
}
