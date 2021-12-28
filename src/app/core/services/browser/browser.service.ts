import { Inject, Injectable } from '@angular/core';
import { Browser } from '@shared/models/browser/browser';
import { WINDOW } from '@ng-web-apis/common';
import { IframeService } from 'src/app/core/services/iframe/iframe.service';
import { RubicWindow } from '@shared/utils/rubic-window';

@Injectable({
  providedIn: 'root'
})
export class BrowserService {
  private mobileBreakpoint = 500;

  public get currentBrowser(): Browser {
    switch (true) {
      case this.window.innerWidth >= this.mobileBreakpoint ||
        (this.iframeService.isIframe && this.iframeService.device === 'desktop'):
        return Browser.DESKTOP;
      case !this.window.ethereum:
        return Browser.MOBILE;
      case this.window.ethereum?.isMetaMask:
        return Browser.METAMASK;
      // @ts-ignore
      case this.window.ethereum?.isWalletLink || this.window.ethereum?.isCoinbaseWallet:
        return Browser.COINBASE;
      default:
        return Browser.DESKTOP;
    }
  }

  constructor(
    @Inject(WINDOW) private window: RubicWindow,
    private readonly iframeService: IframeService
  ) {}
}
