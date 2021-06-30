import { ApplicationRef, Inject, Injectable, NgZone } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';
import { WINDOW } from 'src/app/core/models/window';

declare global {
  interface Window {
    testingMode: {
      use: () => void;
      set: () => void;
      clear: () => void;
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
      }
    };

    this.setAliases();

    if (cookieService.get('testingMode') === 'true') {
      setTimeout(() => this.useTestingMode(), 2000);
    }
  }

  private setAliases() {
    Object.defineProperty(this.window, 'tu', {
      get() {
        this.window.testingMode.use();
      }
    });

    Object.defineProperty(this.window, 'ts', {
      get() {
        this.window.testingMode.set();
      }
    });

    Object.defineProperty(this.window, 'tc', {
      get() {
        this.window.testingMode.clear();
      }
    });
  }

  private useTestingMode() {
    if (!this.isTestingMode.getValue()) {
      this.isTestingMode.next(true);
    }
    this.zone.run(() => {
      setTimeout(() => this.appRef.tick(), 100);
    });
  }
}
