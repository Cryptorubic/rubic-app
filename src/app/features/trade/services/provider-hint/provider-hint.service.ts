import { Injectable } from '@angular/core';
import { BehaviorSubject, distinctUntilChanged } from 'rxjs';

@Injectable()
export class ProviderHintService {
  private readonly _hideProviderHint$ = new BehaviorSubject<boolean>(false);

  public readonly hideProviderHint$ = this._hideProviderHint$.pipe(distinctUntilChanged());

  public setHintVisibility(isScrollStart: boolean): void {
    this._hideProviderHint$.next(isScrollStart);
  }
}
