import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SwapInfoService {
  private _onInfoCalculated$ = new Subject<void>();

  public onInfoCalculated$ = this._onInfoCalculated$.asObservable();

  constructor() {}

  public emitInfoCalculated(): void {
    this._onInfoCalculated$.next();
  }
}
