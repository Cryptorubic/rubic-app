import { Injectable } from '@angular/core';
import { BehaviorSubject, from, Observable, throwError } from 'rxjs';
import { List } from 'immutable';
import { HttpClient } from '@angular/common/http';
import BigNumber from 'bignumber.js';
import { catchError, flatMap, map, mergeMap } from 'rxjs/operators';

import { Web3PrivateService } from '../../../core/services/blockchain/web3-private-service/web3-private.service';
import { BridgeTransaction } from './BridgeTransaction';
import { NetworkError } from '../../../shared/models/errors/provider/NetworkError';
import { RubicError } from '../../../shared/models/errors/RubicError';
import { OverQueryLimitError } from '../../../shared/models/errors/bridge/OverQueryLimitError';
import { BackendApiService } from '../../../core/services/backend/backend-api/backend-api.service';
import { MetamaskError } from '../../../shared/models/errors/provider/MetamaskError';
import { AccountError } from '../../../shared/models/errors/provider/AccountError';
import { BridgeToken } from '../models/BridgeToken';
import { BridgeTableTransaction } from '../models/BridgeTableTransaction';
import { TokensService } from '../../../core/services/backend/tokens-service/tokens.service';
import SwapToken from '../../../shared/models/tokens/SwapToken';
import { BLOCKCHAIN_NAME } from '../../../shared/models/blockchain/BLOCKCHAIN_NAME';

interface BinanceResponse {
  code: number;
  data: any;
}

@Injectable()
export class BridgeService {
  private apiUrl = 'https://api.binance.org/bridge/api/v2/';

  private _tokens: BehaviorSubject<List<BridgeToken>> = new BehaviorSubject(List([]));

  private _transactions: BehaviorSubject<List<BridgeTableTransaction>> = new BehaviorSubject(
    List([])
  );

  public walletAddress: string;

  public readonly tokens: Observable<List<BridgeToken>> = this._tokens.asObservable();

  public readonly transactions: Observable<
    List<BridgeTableTransaction>
  > = this._transactions.asObservable();

  constructor(
    private tokensService: TokensService,
    private httpClient: HttpClient,
    private web3Private: Web3PrivateService,
    private backendApiService: BackendApiService
  ) {
    this.getTokensList();
    this.updateTransactionsList();
    this.walletAddress = web3Private.address;
  }

  private getTokensList(): void {
    this.httpClient
      .get(`${this.apiUrl}tokens`)
      .pipe(
        mergeMap((res: BinanceResponse) => {
          if (res.code !== 20000) {
            console.log(`Error retrieving Todos, code ${res.code}`);
            return List([]);
          }
          return this.tokensService.tokens.pipe(
            map(tokens => this.getTokensWithImages(List(res.data.tokens), tokens))
          );
        })
      )
      .subscribe(tokens => this._tokens.next(tokens));
  }

  private getTokensWithImages(
    tokens: List<BridgeToken>,
    swapTokens: List<SwapToken>
  ): List<BridgeToken> {
    return tokens
      .filter(token => token.ethContractAddress || token.symbol === 'ETH')
      .map(token => {
        const tokenInfo = swapTokens
          .filter(item => item.blockchain === BLOCKCHAIN_NAME.ETHEREUM)
          .find(item =>
            token.ethContractAddress
              ? item.address === token.ethContractAddress
              : item.symbol === 'ETH'
          );
        token.icon = (tokenInfo && tokenInfo.image) || '/assets/images/icons/coins/empty.svg';
        return token;
      });
  }

  public getFee(tokenSymbol: string, networkName: string): Observable<number> {
    return this.httpClient.get(`${this.apiUrl}tokens/${tokenSymbol}/networks`).pipe(
      // eslint-disable-next-line consistent-return
      map((res: BinanceResponse) => {
        if (res.code !== 20000) {
          console.log(`Error retrieving tokens, code ${res.code}`);
        } else {
          return res.data.networks.find(network => network.name === networkName).networkFee;
        }
      }),
      catchError(err => {
        console.log(`Error retrieving tokens ${err}`);
        return throwError(err);
      })
    );
  }

  public createTrade(
    token: BridgeToken,
    fromNetwork: BLOCKCHAIN_NAME,
    toNetwork: string,
    amount: BigNumber,
    toAddress: string,
    onTransactionHash?: (hash: string) => void
  ): Observable<string> {
    if (!this.web3Private.isProviderActive) {
      return throwError(new MetamaskError());
    }

    if (!this.web3Private.address) {
      return throwError(new AccountError());
    }

    if (!this.web3Private.network || this.web3Private.network.name !== fromNetwork) {
      return throwError(new NetworkError(fromNetwork));
    }

    const body = {
      amount: amount.toString(),
      fromNetwork,
      source: 921,
      symbol: token.symbol,
      toAddress,
      toAddressLabel: '',
      toNetwork,
      walletAddress: this.web3Private.address,
      walletNetwork: toNetwork
    };

    return this.httpClient.post(`${this.apiUrl}swaps/`, body).pipe(
      flatMap((res: BinanceResponse) => {
        if (res.code !== 20000) {
          console.log(`Bridge POST error, code ${res.code}`);
          return throwError(new OverQueryLimitError());
        }
        const { data } = res;
        const tx = new BridgeTransaction(
          data.id,
          fromNetwork,
          token,
          data.status,
          data.depositAddress,
          amount,
          data.toAddress,
          this.web3Private
        );
        return from(this.sendDeposit(tx, onTransactionHash));
      }),
      catchError(err => {
        console.error(`Error bridge post ${err}`);
        return throwError(err instanceof RubicError ? err : new RubicError());
      })
    );
  }

  private async sendDeposit(
    tx: BridgeTransaction,
    onTransactionHash?: (hash: string) => void
  ): Promise<string> {
    const onTxHash = async (hash: string): Promise<void> => {
      if (onTransactionHash && typeof onTransactionHash === 'function') {
        onTransactionHash(hash);
      }

      await this.sendTransactionInfo(tx);
      await this.updateTransactionsList();
      this.backendApiService.notifyBridgeBot(tx, this.web3Private.address);
    };

    await tx.sendDeposit(onTxHash);

    return tx.binanceId;
  }

  public async updateTransactionsList(): Promise<void> {
    if (this.web3Private.address) {
      const txArray = await this.backendApiService.getTransactions(
        this.web3Private.address.toLowerCase()
      );
      this._transactions.next(List(txArray));
    }
  }

  private async sendTransactionInfo(tx: BridgeTransaction): Promise<void> {
    return this.backendApiService.postTransaction(
      tx.binanceId,
      tx.token.ethSymbol,
      tx.token.bscSymbol
    );
  }
}
