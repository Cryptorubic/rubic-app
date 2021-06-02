import { ApplicationRef, Injectable, NgZone } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

declare global {
  interface Window {
    useTestingMode: () => Promise<void>;
  }
}

@Injectable({
  providedIn: 'root'
})
export class UseTestingModeService {
  public isTestingMode = new BehaviorSubject(false);

  constructor(private zone: NgZone, private appRef: ApplicationRef) {
    window.useTestingMode = async () => {
      if (!this.isTestingMode.getValue()) {
        this.isTestingMode.next(true);
      }
      this.zone.run(() => {
        setTimeout(() => this.appRef.tick(), 1000);
      });
    };
  }
}
