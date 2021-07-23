import { Injectable } from '@angular/core';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { Web3Public } from 'src/app/core/services/blockchain/web3-public-service/Web3Public';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ProviderConnectorService } from 'src/app/core/services/blockchain/provider-connector/provider-connector.service';
import {
  OneInchApproveResponse,
  OneInchTokensResponse
} from 'src/app/features/instant-trade/services/instant-trade-service/models/one-inch.types';
import { map, switchMap } from 'rxjs/operators';
import InstantTradeToken from 'src/app/features/instant-trade/models/InstantTradeToken';
import InstantTrade from 'src/app/features/instant-trade/models/InstantTrade';
import { WalletError } from 'src/app/core/errors/models/provider/WalletError';
import { AccountError } from 'src/app/core/errors/models/provider/AccountError';
import { WALLET_NAME } from 'src/app/core/header/components/header/components/wallets-modal/models/providers';
import { NetworkError } from 'src/app/core/errors/models/provider/NetworkError';
import { NotSupportedNetworkError } from 'src/app/core/errors/models/provider/NotSupportedNetwork';
import InsufficientFundsError from 'src/app/core/errors/models/instant-trade/InsufficientFundsError';
import { from, Observable, of } from 'rxjs';
import { Web3PrivateService } from 'src/app/core/services/blockchain/web3-private-service/web3-private.service';
import { BlockchainsInfo } from 'src/app/core/services/blockchain/blockchain-info';
import BigNumber from 'bignumber.js';
import CustomError from 'src/app/core/errors/models/custom-error';
import networks from 'src/app/shared/constants/blockchain/networks';

@Injectable({
  providedIn: 'root'
})
export class CommonOneinchService {
  private readonly oneInchNativeAddress: string;

  private readonly apiBaseUrl: string;

  constructor(
    private readonly httpClient: HttpClient,
    private readonly web3Private: Web3PrivateService
  ) {
    this.oneInchNativeAddress = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';
    this.apiBaseUrl = 'https://api.1inch.exchange/v3.0/';
  }

  public loadSupportedTokens(blockchainId: number): Observable<string[]> {
    return this.httpClient
      .get(`${this.apiBaseUrl}${blockchainId}/tokens`)
      .pipe(map((response: OneInchTokensResponse) => Object.keys(response.tokens)));
  }

  private loadApproveAddress(blockchainId: number): Observable<string> {
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
          trade.from.amount.toFixed()
        );
      }
    } else {
      const tokensBalance = await web3.getTokenBalance(address, trade.from.token.address);
      if (tokensBalance.lt(amountIn)) {
        const formattedTokensBalance = tokensBalance.div(10 ** trade.from.token.decimals).toFixed();
        throw new InsufficientFundsError(
          trade.from.token.symbol,
          formattedTokensBalance,
          trade.from.amount.toFixed()
        );
      }
    }
  }

  public getAllowance(
    tokenAddress: string,
    web3Public: Web3Public,
    blockchain: BLOCKCHAIN_NAME,
    userAddress: string
  ): Observable<BigNumber> {
    if (web3Public.isNativeAddress(tokenAddress)) {
      return of(new BigNumber(Infinity));
    }
    return this.loadApproveAddress(BlockchainsInfo.getBlockchainByName(blockchain).id).pipe(
      switchMap(address => from(web3Public.getAllowance(tokenAddress, userAddress, address)))
    );
  }

  public async approve(
    tokenAddress: string,
    blockchain: BLOCKCHAIN_NAME,
    options: { onTransactionHash?: (hash: string) => void }
  ): Promise<void> {
    const approveAddress = await this.loadApproveAddress(
      BlockchainsInfo.getBlockchainByName(blockchain).id
    ).toPromise();
    const uintInfinity = new BigNumber(2).pow(256).minus(1);
    await this.web3Private.approveTokens(tokenAddress, approveAddress, uintInfinity, options);
  }

  public specifyError(err: HttpErrorResponse, blockchain: BLOCKCHAIN_NAME): never {
    if (err.error.message.includes("cannot estimate. Don't forget about miner fee.")) {
      const nativeToken = networks.find(el => el.name === blockchain).nativeCoin.symbol;
      const message = `Can't estimate. Don't forget about miner fee. Try to leave the buffer of ${nativeToken} for gas.`;
      throw new CustomError(message);
    }
    throw new CustomError(err.error.message);
  }
}
