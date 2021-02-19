import { EventEmitter, Injectable, Output } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import BigNumber from 'bignumber.js';

interface TokenInterface {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
}
export type TokensMap<T> = { [key in any]: T };
const api = {
  host: 'https://api.1inch.exchange',
  version: 'v1.1'
};

const slippageValue = 1;

@Injectable({
  providedIn: 'root'
})
export class OneInchService {
  private availableTokens: TokensMap<TokenInterface>;
  private tokenOnLoadEmitter = new EventEmitter<any>();
  private tokensAutocompleteList: any[] = [];
  constructor(private httpClient: HttpClient) {
    this.loadTokens().then(result => {
      result.ETH.address = '0x0000000000000000000000000000000000000000';

      result.RBC = {
        symbol: 'RBC',
        name: 'Rubic',
        decimals: 18,
        address: '0xa4eed63db85311e22df4473f87ccfc3dadcfa3e3'
      };

      this.availableTokens = result;
      this.tokenOnLoadEmitter.emit();
    });
  }

  private getHttpPromise(path, method, params?: {}) {
    let url = `${api.host}/${api.version}/${path}`;
    params = params || {};
    switch (method) {
      case 'get':
        const pairsParams = [];
        for (let k in params) {
          pairsParams.push(`${k}=${params[k]}`);
        }
        url += pairsParams.length ? '?' + pairsParams.join('&') : '';
        break;
    }
    return this.httpClient[method](url).toPromise();
  }

  private async loadTokens() {
    return this.getHttpPromise('tokens', 'get');
  }

  public getAutocompleteTokensList(): any {
    return this.tokensAutocompleteList;
  }

  public onLoadTokens(): EventEmitter<any> {
    if (this.availableTokens) {
      setTimeout(() => {
        for (let k in this.availableTokens) {
          const t = this.availableTokens[k];
          const coingeckoToken = window['coingecko_tokens'].find(
            coingeckoT => t.address.toLowerCase() === coingeckoT.address.toLowerCase()
          );
          this.tokensAutocompleteList.push({
            address: t.address,
            decimals: t.decimals,
            image_link: coingeckoToken
              ? coingeckoToken.image_link
              : './assets/images/icons/coins/empty.svg',
            platform: 'ethereum',
            coingecko_rank: coingeckoToken ? coingeckoToken.coingecko_rank : null,
            usd_price: coingeckoToken ? coingeckoToken.usd_price : null,
            token_title: t.name,
            token_short_title: k
          });
        }

        // const allETHTokens = window['coingecko_tokens'].filter((token) => {
        //     return token.platform === 'ethereum';
        // });
        //
        // allETHTokens.forEach((token) => {
        //     const tokenAddress = token.address.toLowerCase();
        //     const tokenIsExists = this.tokensAutocompleteList.find((exToken: TokenInterface) => {
        //         return exToken.address.toLowerCase() === tokenAddress;
        //     });
        //     if (!tokenIsExists) {
        //         const coingeckoToken = window['coingecko_tokens'].find((exToken: TokenInterface) => {
        //             return exToken.address.toLowerCase() === tokenAddress;
        //         });
        //         if (coingeckoToken) {
        //             this.tokensAutocompleteList.push(coingeckoToken);
        //             this.availableTokens[coingeckoToken.token_short_title] = coingeckoToken;
        //         }
        //     }
        // });

        this.tokensAutocompleteList.sort((a, b) => {
          const aRank = a.coingecko_rank || 100000;
          const bRank = b.coingecko_rank || 100000;
          return aRank > bRank ? 1 : aRank < bRank ? -1 : 0;
        });

        this.tokenOnLoadEmitter.emit();
      });
    }

    return this.tokenOnLoadEmitter;
  }

  public checkToken(token): boolean {
    const availableToken = this.availableTokens[token.token_short_title];
    return availableToken && availableToken.address.toLowerCase() === token.address.toLowerCase();
  }

  public checkTokensPair(quoteToken, baseToken): boolean {
    return this.checkToken(baseToken) && this.checkToken(quoteToken);
  }

  private checkSwap(params) {
    let deepLevel = 0;
    let latestResult;

    const requestParams = {
      gasPrice: '35000000000',
      mainRouteParts: 20,
      parts: 20,
      protocolWhiteList:
        'WETH,UNISWAP_V1,UNISWAP_V2,SUSHI,MOONISWAP,BALANCER,COMPOUND,CURVE,CHAI,OASIS,KYBER,AAVE,IEARN,BANCOR,PMM1,CREAMSWAP,SWERVE,BLACKHOLESWAP,DODO,VALUELIQUID,SHELL',
      virtualParts: 20,
      protocols:
        'WETH,UNISWAP_V1,UNISWAP_V2,SUSHI,MOONISWAP,BALANCER,COMPOUND,CURVE,CHAI,OASIS,KYBER,AAVE,IEARN,BANCOR,PMM1,CREAMSWAP,SWERVE,BLACKHOLESWAP,DODO,VALUELIQUID,SHELL',
      deepLevels: '1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1',
      mainRoutePartsList: '1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1',
      partsList: '1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1',
      virtualPartsList: '1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1'
    };

    for (let k in params) {
      requestParams[k] = params[k];
    }

    const getQuery = params => {
      params.deepLevel = deepLevel;
      const pairsParams = [];
      for (let k in params) {
        pairsParams.push(`${k}=${params[k]}`);
      }
      return pairsParams.join('&');
    };

    return new Promise(resolve => {
      const sendRequest = () => {
        deepLevel++;
        const query = getQuery(requestParams);
        this.httpClient
          .get(`https://api.1inch.exchange/v2.0/quote?${query}`)
          .toPromise()
          .then((result: any) => {
            if (deepLevel < 2) {
              latestResult = result;
              sendRequest();
            } else {
              let bestResult;
              const oldToAmountValue = new BigNumber(latestResult.toTokenAmount);
              const currToAmountValue = new BigNumber(result.toTokenAmount);
              if (oldToAmountValue.minus(currToAmountValue).isPositive()) {
                bestResult = latestResult;
              } else {
                bestResult = result;
              }
              resolve(bestResult);
            }
          });
      };
      sendRequest();
    });
  }

  private static checkETHAddress(address) {
    if (address === '0x0000000000000000000000000000000000000000') {
      return '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';
    }
    return address;
  }

  public getQuote(params, tokenAddress?: string) {
    params = params || {};
    const fromAddress = this.availableTokens[params.fromTokenSymbol].address;
    const toAddress = tokenAddress || this.availableTokens[params.toTokenSymbol].address;
    return this.checkSwap({
      fromTokenAddress: OneInchService.checkETHAddress(fromAddress),
      toTokenAddress: OneInchService.checkETHAddress(toAddress),
      amount: params.amount
    });
  }

  private async getGasPrice() {
    return this.httpClient
      .get('https://gas-price-api.1inch.exchange/v1.0')
      .toPromise()
      .then(gasPrices => {
        return gasPrices['standard'];
      });
  }

  public async getApproveSpender() {
    return this.httpClient.get('https://api.1inch.exchange/v2.0/approve/spender').toPromise();
  }

  public async getSwap(params, queryData) {
    const fromAddress = this.availableTokens[params.fromTokenSymbol].address;
    const toAddress = this.availableTokens[params.toTokenSymbol].address;
    const ethValue = params.fromTokenSymbol === 'ETH' ? params.amount : 0;
    const requestParams = {
      fromAddress: params.fromAddress,
      fromTokenAddress: OneInchService.checkETHAddress(fromAddress),
      toTokenAddress: OneInchService.checkETHAddress(toAddress),
      amount: params.amount,
      guaranteedAmount: queryData.toTokenAmount,
      minTokensAmount: new BigNumber(queryData.toTokenAmount)
        .div(100)
        .times(100 - slippageValue)
        .dp(0, 1)
        .toString(10),
      burnChi: false,
      disableEstimate: false,
      ethValue: ethValue,
      referrerAddress: '0x7367409E0c12b2B7cAa5c990E11A75E0D86580fc',
      fee: 0,
      walletAddress: params.fromAddress,
      slippage: slippageValue,
      parts: 20,
      mainRouteParts: 20
    };

    const getQuery = params => {
      const pairsParams = [];
      for (let k in params) {
        pairsParams.push(`${k}=${params[k]}`);
      }
      return pairsParams.join('&');
    };

    return this.httpClient
      .get('https://api.1inch.exchange/v2.0/swap?' + getQuery(requestParams))
      .toPromise();
  }
}
