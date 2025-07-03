import { Inject, Injectable } from '@angular/core';
import { BROWSER } from '@shared/models/browser/browser';
import { WINDOW } from '@ng-web-apis/common';
import { RubicWindow } from '@shared/utils/rubic-window';

@Injectable({
  providedIn: 'root'
})
export class BrowserService {
  private readonly mobileBreakpoint = 500;

  public get currentBrowser(): BROWSER {
    const isMobile = /Android|iPhone|iPad|iPod/i.test(this.window.navigator.userAgent);

    switch (true) {
      case this.window.innerWidth >= this.mobileBreakpoint:
        return BROWSER.DESKTOP;
      case !this.window.ethereum:
        return BROWSER.MOBILE;
      case this.window.ethereum?.isMetaMask && isMobile:
        return BROWSER.METAMASK;
      case this.window.ethereum?.isWalletLink || this.window.ethereum?.isCoinbaseWallet:
        return BROWSER.COINBASE;
      default:
        return BROWSER.DESKTOP;
    }
  }

  constructor(@Inject(WINDOW) private window: RubicWindow) {}
}
