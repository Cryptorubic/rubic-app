import { ApplicationRef, Inject, Injectable, NgZone } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';
import { WINDOW } from '@ng-web-apis/common';

declare global {
  interface Window {
    testingMode: {
      use: () => void;
      set: () => void;
      clear: () => void;
      uniswapSettings: {
        setSecondsDeadline: () => void;
      };
      web3PublicSettings: {
        setRpcTimeout: (timeout: number) => void;
      };
    };
    tu: void;
    ts: void;
    tc: void;
  }
}

@Injectable({
  providedIn: 'root'
})
export class UseTestingModeService {
  public isTestingMode = new BehaviorSubject(false);

  public uniswapSettings = {
    secondsDeadline: new BehaviorSubject(false)
  };

  public web3PublicSettings = {
    rpcTimeout: new Subject<number>()
  };

  constructor(
    @Inject(WINDOW) private window: Window,
    private zone: NgZone,
    private appRef: ApplicationRef,
    cookieService: CookieService
  ) {
    this.window.testingMode = {
      use: () => {
        this.useTestingMode();
      },
      set: () => {
        cookieService.set('testingMode', 'true', null, null, null, null, null);
        this.useTestingMode();
      },
      clear: () => {
        cookieService.delete('testingMode');
        this.window.location.reload();
      },
      uniswapSettings: {
        setSecondsDeadline: () => this.uniswapSettings.secondsDeadline.next(true)
      },
      web3PublicSettings: {
        setRpcTimeout: (timeout: number) => this.web3PublicSettings.rpcTimeout.next(timeout)
      }
    };

    this.setAliases();

    if (cookieService.get('testingMode') === 'true') {
      setTimeout(() => this.useTestingMode(), 2000);
    }
  }

  private setAliases(): void {
    Object.defineProperty(this.window, 'tu', {
      get(): void {
        this.window.testingMode.use();
      }
    });

    Object.defineProperty(this.window, 'ts', {
      get(): void {
        this.window.testingMode.set();
      }
    });

    Object.defineProperty(this.window, 'tc', {
      get(): void {
        this.window.testingMode.clear();
      }
    });
  }

  private useTestingMode(): void {
    if (!this.isTestingMode.getValue()) {
      this.isTestingMode.next(true);
    }
    this.zone.run(() => {
      setTimeout(() => this.appRef.tick(), 100);
    });
  }
}
