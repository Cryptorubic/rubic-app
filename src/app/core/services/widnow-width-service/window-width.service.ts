import { Inject, Injectable } from '@angular/core';
import { WINDOW } from '@ng-web-apis/common';
import { BehaviorSubject, fromEvent } from 'rxjs';
import {
  mobileMdMinus,
  mobileSmMiddle
} from '@core/services/widnow-width-service/constants/width-breakpoints';
import { WindowSize } from '@core/services/widnow-width-service/models/window-size';

@Injectable({
  providedIn: 'root'
})
export class WindowWidthService {
  private readonly _windowSize$ = new BehaviorSubject<WindowSize>(this.getWindowSize());

  public readonly windowSize$ = this._windowSize$.asObservable();

  constructor(@Inject(WINDOW) private readonly window: Window) {
    this.subscribeOnWindowWidthChange();
  }

  private subscribeOnWindowWidthChange(): void {
    fromEvent(this.window, 'resize').subscribe(() => {
      this._windowSize$.next(this.getWindowSize());
    });
  }

  private getWindowSize(): WindowSize {
    const width = this.window.innerWidth;
    if (width <= mobileSmMiddle) {
      return WindowSize.MOBILE_SM_MIDDLE;
    }
    if (width <= mobileMdMinus) {
      return WindowSize.MOBILE_MD_MINUS;
    }
    return WindowSize.DESKTOP;
  }
}
