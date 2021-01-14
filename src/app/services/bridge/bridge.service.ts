import { Injectable } from '@angular/core';
import {BehaviorSubject, Observable, throwError} from 'rxjs';
import {List} from 'immutable';
import {HttpClient} from '@angular/common/http';
import {IBridgeToken, BridgeNetwork} from './types';
import {map, catchError} from 'rxjs/operators';
import {Web3ApiService} from '../web3Api/web3-api.service';


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

  public readonly tokens: Observable<List<IBridgeToken>> = this._tokens.asObservable();

  constructor(private httpClient: HttpClient, private web3Api: Web3ApiService) {
    this.getTokensList();
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
          .filter(token => token.ethContractAddress)
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

  public createTrade(token: IBridgeToken, fromNetwork: string, toNetwork: string, amount: number): Observable<void> {
      if (!this.web3Api.unblocked) {
          return throwError("web3 unavailable");
      }

      const body = {
          amount,
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
          map(
              (res: BinanceResponse) => {
                  debugger;
                  if (res.code !== 20000) {
                      console.log("Error bridge post, code " + res.code)
                  } else {
                      return this.sendDeposit(token, res.data.depositAddress, amount)
                  }
              }),
          catchError(err => {
              console.log("Error bridge post " + err);
              return throwError(err);
          })
      )
  }

  private sendDeposit(token: IBridgeToken, depositAddress: string, amount: number)  {

  }
}
