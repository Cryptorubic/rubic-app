import { Injectable } from '@angular/core';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { Web3Public } from 'src/app/core/services/blockchain/web3-public-service/Web3Public';
import { HttpClient } from '@angular/common/http';
import { ProviderConnectorService } from 'src/app/core/services/blockchain/provider-connector/provider-connector.service';
import {
  OneInchApproveResponse,
  OneInchTokensResponse
} from 'src/app/features/instant-trade/services/instant-trade-service/models/one-inch-types';
import { map } from 'rxjs/operators';
import InstantTradeToken from 'src/app/features/swaps-page-old/instant-trades/models/InstantTradeToken';
import InstantTrade from 'src/app/features/swaps-page-old/instant-trades/models/InstantTrade';
import { WalletError } from 'src/app/core/errors/models/provider/WalletError';
import { AccountError } from 'src/app/core/errors/models/provider/AccountError';
import { WALLET_NAME } from 'src/app/core/header/components/header/components/wallets-modal/models/providers';
import { NetworkError } from 'src/app/core/errors/models/provider/NetworkError';
import { NotSupportedNetworkError } from 'src/app/core/errors/models/provider/NotSupportedNetwork';
import InsufficientFundsError from 'src/app/core/errors/models/instant-trade/InsufficientFundsError';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CommonOneinchService {
  private readonly oneInchNativeAddress: string;

  private readonly apiBaseUrl: string;

  constructor(private readonly httpClient: HttpClient) {
    this.oneInchNativeAddress = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';
    this.apiBaseUrl = 'https://api.1inch.exchange/v3.0/';
  }

  public loadSupportedTokens(blockchainId: number): Observable<string[]> {
    return this.httpClient
      .get(`${this.apiBaseUrl}${blockchainId}/tokens`)
      .pipe(map((response: OneInchTokensResponse) => Object.keys(response.tokens)));
  }

  public loadApproveAddress(blockchainId: number): Observable<string> {
    return this.httpClient
      .get(`${this.apiBaseUrl}${blockchainId}/approve/spender`)
      .pipe(map((response: OneInchApproveResponse) => response.address));
  }

  public getOneInchTokenSpecificAddresses(
    fromToken: InstantTradeToken,
    toToken: InstantTradeToken,
    web3: Web3Public
  ): { fromTokenAddress: string; toTokenAddress: string } {
    const fromTokenAddress = web3.isNativeAddress(fromToken.address)
      ? this.oneInchNativeAddress
      : fromToken.address;
    const toTokenAddress = web3.isNativeAddress(toToken.address)
      ? this.oneInchNativeAddress
      : toToken.address;
    return { fromTokenAddress, toTokenAddress };
  }

  public checkSettings(
    selectedBlockchain: BLOCKCHAIN_NAME,
    providerConnector: ProviderConnectorService
  ): void {
    if (!providerConnector.isProviderActive) {
      throw new WalletError();
    }
    if (!providerConnector.address) {
      throw new AccountError();
    }
    if (providerConnector.networkName !== selectedBlockchain) {
      if (providerConnector.networkName !== `${selectedBlockchain}_TESTNET`) {
        if (providerConnector.providerName === WALLET_NAME.METAMASK) {
          throw new NetworkError(selectedBlockchain);
        } else {
          throw new NotSupportedNetworkError(selectedBlockchain);
        }
      }
    }
  }

  public async checkBalance(trade: InstantTrade, web3: Web3Public, address: string): Promise<void> {
    const amountIn = trade.from.amount.multipliedBy(10 ** trade.from.token.decimals).toFixed(0);

    if (web3.isNativeAddress(trade.from.token.address)) {
      const balance = await web3.getBalance(address, {
        inWei: true
      });
      if (balance.lt(amountIn)) {
        const formattedBalance = web3.weiToEth(balance);
        throw new InsufficientFundsError(
          trade.from.token.symbol,
          formattedBalance,
          trade.from.amount.toString()
        );
      }
    } else {
      const tokensBalance = await web3.getTokenBalance(address, trade.from.token.address);
      if (tokensBalance.lt(amountIn)) {
        const formattedTokensBalance = tokensBalance
          .div(10 ** trade.from.token.decimals)
          .toString();
        throw new InsufficientFundsError(
          trade.from.token.symbol,
          formattedTokensBalance,
          trade.from.amount.toString()
        );
      }
    }
  }
}
