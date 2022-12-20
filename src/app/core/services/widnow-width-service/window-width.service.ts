import { Inject, Injectable } from '@angular/core';
import { WINDOW } from '@ng-web-apis/common';
import { BehaviorSubject, fromEvent } from 'rxjs';
import {
  laptop,
  mobileMd,
  mobileMdMinus,
  mobileSmMiddle,
  tablet
} from '@core/services/widnow-width-service/constants/width-breakpoints';
import { WindowSize } from '@core/services/widnow-width-service/models/window-size';

@Injectable({
  providedIn: 'root'
})
export class WindowWidthService {
  private readonly _windowSize$ = new BehaviorSubject<WindowSize>(this.getWindowSize());

  public readonly windowSize$ = this._windowSize$.asObservable();

  public get windowSize(): WindowSize {
    return this._windowSize$.value;
  }

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
    if (width <= mobileMd) {
      return WindowSize.MOBILE_MD;
    }
    if (width <= tablet) {
      return WindowSize.TABLET;
    }
    if (width <= laptop) {
      return WindowSize.LAPTOP;
    }
    return WindowSize.DESKTOP;
  }
}
