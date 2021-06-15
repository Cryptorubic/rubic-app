import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { TRADE_MODE } from '../../../../features/swaps-page-old/trades-module/models';

@Injectable({
  providedIn: 'root'
})
export class TradeTypeService {
  private _selectedMode = new BehaviorSubject<TRADE_MODE>(TRADE_MODE.INSTANT_TRADE);

  private _selectedBlockchain = new BehaviorSubject<BLOCKCHAIN_NAME>(BLOCKCHAIN_NAME.ETHEREUM);

  public getMode(): Observable<TRADE_MODE> {
    return this._selectedMode.asObservable();
  }

  public setMode(value: TRADE_MODE) {
    this._selectedMode.next(value);
  }

  public getBlockchain(): Observable<BLOCKCHAIN_NAME> {
    return this._selectedBlockchain.asObservable();
  }

  public setBlockchain(value: BLOCKCHAIN_NAME) {
    this._selectedBlockchain.next(value);
  }

  constructor() {}
}
