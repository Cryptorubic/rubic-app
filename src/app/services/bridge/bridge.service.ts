import { Injectable } from '@angular/core';
import {BehaviorSubject, from, observable, Observable, throwError} from 'rxjs';
import {List} from 'immutable';
import {HttpClient} from '@angular/common/http';
import {IBridgeToken, BridgeNetwork} from './types';
import {map, catchError, flatMap} from 'rxjs/operators';
import {Web3ApiService} from '../web3Api/web3-api.service';
import {BridgeTransaction} from './BridgeTransaction';
import {NetworkError} from '../../errors/bridge/NetworkError';
import {RubicError} from '../../errors/RubicError';
import BigNumber from 'bignumber.js';


interface BinanceResponse {
  code: number,
  data: any
}


@Injectable({
  providedIn: 'root'
})
export class BridgeService {
  private apiUrl = "https://api.binance.org/bridge/api/v2/"
  private _tokens: BehaviorSubject<List<IBridgeToken>> = new BehaviorSubject(List([]));
  public walletAddress: string;

  public readonly tokens: Observable<List<IBridgeToken>> = this._tokens.asObservable();

  constructor(private httpClient: HttpClient, private web3Api: Web3ApiService) {
    this.getTokensList();
    this.walletAddress = web3Api.address;
  }

  private getTokensList(): void {
    this.httpClient.get(this.apiUrl + 'tokens').subscribe(
        (res: BinanceResponse) => {
          if (res.code !== 20000) {
            console.log("Error retrieving Todos, code " + res.code)
          } else {
            const tokensWithUpdatedImages = this.getTokensImages(List(res.data.tokens));
            this._tokens.next(tokensWithUpdatedImages);
          }
        },
        err => console.log("Error retrieving tokens " + err)
    )
  }

  private getTokensImages(tokens: List<IBridgeToken>): List<IBridgeToken> {
      // @ts-ignore
      const allTokensList = window.cmc_tokens; // TODO: отрефакторить этот кошмар с cmc_tokens

      return tokens
          .filter(token => token.ethContractAddress || token.symbol === 'ETH')
          .map(token => {
              const tokenInfo = allTokensList.find(item => item.token_short_name === token.symbol);
              token.icon = (tokenInfo && tokenInfo.image_link) ? tokenInfo.image_link : "";
              return token;
         })
  }

  public getFee(tokenSymbol: string, networkName: string): Observable<number> {
      return this.httpClient.get(this.apiUrl + `tokens/${tokenSymbol}/networks`).pipe(
          map(
          (res: BinanceResponse) => {
              if (res.code !== 20000) {
                  console.log("Error retrieving tokens, code " + res.code)
              } else {
                  return res.data.networks
                      .find(network => network.name === networkName)
                      .networkFee
              }
          }),
          catchError(err => {
              console.log("Error retrieving tokens " + err);
              return throwError(err);
          })
      )
  }

  public createTrade(
      token: IBridgeToken,
      fromNetwork: string,
      toNetwork: string,
      amount: BigNumber,
      onTransactionHash?: (hash:string) => void
  ): Observable<void> {
      const body = {
          amount: amount.toString(),
          fromNetwork,
          source: 921,
          symbol: token.symbol,
          toAddress: this.web3Api.address,
          toAddressLabel: "",
          toNetwork,
          walletAddress: this.web3Api.address,
          walletNetwork: toNetwork
      }

      return this.httpClient.post(this.apiUrl + `swaps/`, body).pipe(
          flatMap(
              (res: BinanceResponse) => {
                  debugger;
                  if (res.code !== 20000) {
                      console.log("Bridge POST error, code " + res.code);
                      return throwError(new RubicError("Bridge POST error, code " + res.code));
                  } else {
                      const data = res.data;
                      const tx = new BridgeTransaction(
                          data.id,
                          fromNetwork,
                          token,
                          data.status,
                          data.depositAddress,
                          amount,
                          data.toAddress,
                          this.web3Api
                      );
                      return from(this.sendDeposit(tx, onTransactionHash));
                  }
              }),
          catchError(err => {
              console.error("Error bridge post " + err);
              return throwError(err instanceof  RubicError ? err : new RubicError());
          })
      )
  }

  private sendDeposit(tx: BridgeTransaction, onTransactionHash?: (hash:string) => void): Promise<void>  {
      if (!this.web3Api.network || this.web3Api.network.name !== tx.network) {
          throw new NetworkError(tx.network);
      }
      if (this.web3Api.error) {
          throw this.web3Api.error
      }
      return tx.sendDeposit(onTransactionHash);
  }
}
