import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UseTestingModeService {
  public isTestingMode = new BehaviorSubject(false);

  constructor() {
    window['useTestingMode'] = () => {
      if (!this.isTestingMode.getValue()) {
        this.isTestingMode.next(true);
      }
    };
  }
}
