import { Injectable } from '@angular/core';
import {BehaviorSubject, Observable, throwError} from 'rxjs';
import {List} from 'immutable';
import {HttpClient} from '@angular/common/http';
import {IBridgeToken, BridgeNetwork} from './types';
import {map, catchError} from 'rxjs/operators';


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

  constructor(private httpClient: HttpClient) {
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

      return tokens.map(token => {
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
                  console.log("Error retrieving Todos, code " + res.code)
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
}
