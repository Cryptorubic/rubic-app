import { ApplicationRef, Injectable, NgZone } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UseTestingModeService {
  public isTestingMode = new BehaviorSubject(false);

  constructor(private zone: NgZone, private appRef: ApplicationRef) {
    window['useTestingMode'] = () => {
      if (!this.isTestingMode.getValue()) {
        this.isTestingMode.next(true);
      }
      this.zone.run(() => {
        setTimeout(() => this.appRef.tick(), 500);
        setTimeout(() => this.appRef.tick(), 2000);
      });
    };
  }
}
