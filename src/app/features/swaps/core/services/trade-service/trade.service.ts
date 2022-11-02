import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TradeService {
  private readonly _isButtonHovered$ = new BehaviorSubject<boolean>(false);

  public readonly isButtonHovered$ = this._isButtonHovered$.asObservable();

  public set isButtonHovered(value: boolean) {
    this._isButtonHovered$.next(value);
  }
}
