import { Injectable } from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';
import {List} from 'immutable';
import {HttpClient} from '@angular/common/http';
import IBridgeToken from './IBridgeToken';


interface BinanceResponse {
  code: number,
  data: any
}


@Injectable({
  providedIn: 'root'
})
export class BridgeService {
  private apiUrl = "https://api.binance.org/bridge/"
  private _tokens: BehaviorSubject<List<IBridgeToken>> = new BehaviorSubject(List([]));

  public readonly tokens: Observable<List<IBridgeToken>> = this._tokens.asObservable();

  constructor(private httpClient: HttpClient) {
    this.getTokensList();
  }

  private getTokensList() {
    this.httpClient.get(this.apiUrl + 'api/v2/tokens').subscribe(
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
}
