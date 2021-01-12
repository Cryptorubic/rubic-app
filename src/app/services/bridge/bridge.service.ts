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
            this._tokens.next(List(res.data.tokens));
          }
        },
        err => console.log("Error retrieving tokens " + err)
    );
  }
}
