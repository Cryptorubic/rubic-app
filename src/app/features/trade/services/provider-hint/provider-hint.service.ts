import { Injectable } from '@angular/core';
import { BehaviorSubject, distinctUntilChanged, Observable } from 'rxjs';

@Injectable()
export class ProviderHintService {
  private readonly _hideProviderHint$ = new BehaviorSubject<boolean>(false);

  public get hideProviderHint$(): Observable<boolean> {
    return this._hideProviderHint$.pipe(distinctUntilChanged());
  }

  public hideHint(isScrollStart: boolean): void {
    this._hideProviderHint$.next(isScrollStart);
  }
}
