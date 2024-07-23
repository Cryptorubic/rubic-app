import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable()
export class ProviderHintService {
  private readonly _hideProviderHintOnScroll$ = new BehaviorSubject<boolean>(false);

  public get hideProviderHintOnScroll$(): Observable<boolean> {
    return this._hideProviderHintOnScroll$.asObservable();
  }

  public hideProviderHintOnScroll(isScrollStart: boolean): void {
    this._hideProviderHintOnScroll$.next(isScrollStart);
  }
}
