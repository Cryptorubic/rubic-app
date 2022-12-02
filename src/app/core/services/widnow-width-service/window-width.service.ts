import { Inject, Injectable } from '@angular/core';
import { WINDOW } from '@ng-web-apis/common';
import { BehaviorSubject, fromEvent } from 'rxjs';
import { mobileMdMinus } from '@core/services/widnow-width-service/constants/width-breakpoints';

@Injectable({
  providedIn: 'root'
})
export class WindowWidthService {
  private readonly _mobileMdMinus$ = new BehaviorSubject<boolean>(
    this.window.innerWidth <= mobileMdMinus
  );

  public readonly mobileMdMinus$ = this._mobileMdMinus$.asObservable();

  constructor(@Inject(WINDOW) private readonly window: Window) {
    this.subscribeOnWindowWidthChange();
  }

  private subscribeOnWindowWidthChange(): void {
    fromEvent(this.window, 'resize').subscribe(() => {
      this._mobileMdMinus$.next(this.window.innerWidth <= mobileMdMinus);
    });
  }
}
