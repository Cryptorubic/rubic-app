import { Injectable } from '@angular/core';
import InstantTradeService from '../InstantTradeService';
import BigNumber from 'bignumber.js';
import { InstantTrade, InstantTradeToken } from '../types';
import { TransactionReceipt } from 'web3-eth';
import { HttpClient } from '@angular/common/http';
import { CoingeckoApiService } from '../../coingecko-api/coingecko-api.service';
import { Web3ApiService } from '../../blockchain/web3PrivateService/web3-api.service';

interface OneInchQuoteResponse {
  fromToken: Object;
  toToken: Object;
  toTokenAmount: string;
  fromTokenAmount: string;
  protocols: unknown[];
  estimatedGas: string;
}

@Injectable({
  providedIn: 'root'
})
export class OneInchService extends InstantTradeService {
  private readonly apiBaseUrl = 'https://api.1inch.exchange/v2.0/';
  private readonly oneInchEtherAddress = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';
  constructor(
    private httpClient: HttpClient,
    private coingeckoApiService: CoingeckoApiService,
    private web3Api: Web3ApiService
  ) {
    super();
  }

  public async calculateTrade(
    fromAmount: BigNumber,
    fromToken: InstantTradeToken,
    toToken: InstantTradeToken
  ): Promise<InstantTrade> {
    const { fromTokenAddress, toTokenAddress } = this.getOneInchTokenSpecificAddresses(
      fromToken,
      toToken
    );
    const oneInchTrade: OneInchQuoteResponse = (await this.httpClient
      .get(this.apiBaseUrl + 'quote', {
        params: {
          fromTokenAddress,
          toTokenAddress,
          amount: fromAmount.multipliedBy(10 ** fromToken.decimals).toFixed(0)
        }
      })
      .toPromise()) as OneInchQuoteResponse;

    if (oneInchTrade.hasOwnProperty('errors') || !oneInchTrade.toTokenAmount) {
      console.error(oneInchTrade);
      throw new Error('Oneinch quote error');
    }

    const estimatedGas = new BigNumber(oneInchTrade.estimatedGas);
    const ethPrice = await this.coingeckoApiService.getEtherPriceInUsd();

    const gasFeeInUsd = await this.web3Api.getGasFee(estimatedGas, ethPrice);
    const gasFeeInEth = await this.web3Api.getGasFee(estimatedGas, new BigNumber(1));

    return {
      from: {
        token: fromToken,
        amount: fromAmount
      },
      to: {
        token: toToken,
        amount: new BigNumber(oneInchTrade.toTokenAmount).div(10 ** toToken.decimals)
      },
      estimatedGas,
      gasFeeInUsd,
      gasFeeInEth
    };
  }

  public async createTrade(
    trade: InstantTrade,
    options: { onConfirm?: (hash: string) => void; onApprove?: (hash: string | null) => void }
  ): Promise<TransactionReceipt> {
    return new Promise(resolve => resolve(undefined));
  }

  private getOneInchTokenSpecificAddresses(
    fromToken: InstantTradeToken,
    toToken: InstantTradeToken
  ): { fromTokenAddress: string; toTokenAddress: string } {
    const fromTokenAddress = this.web3Api.isEtherAddress(fromToken.address)
      ? this.oneInchEtherAddress
      : fromToken.address;
    const toTokenAddress = this.web3Api.isEtherAddress(toToken.address)
      ? this.oneInchEtherAddress
      : toToken.address;
    return { fromTokenAddress, toTokenAddress };
  }
}
