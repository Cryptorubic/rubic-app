import { Injector, Component, Type } from '@angular/core';
import { Observable } from 'rxjs';
import { TradesHistory } from '@core/header/components/header/components/mobile-user-profile/mobile-user-profile.component';

export interface IMobileNativeOptions {
  title?: string;
  data?: object;
  fitContent?: boolean;
  scrollableContent?: boolean;
  forceClose$?: Observable<void>;
  nextModal$?: Observable<INextModal>;
  previousComponent?: boolean;
  tradesHistory?: TradesHistory;
}

export interface INextModal extends IMobileNativeOptions {
  component?: Type<Component & object>;
  data?: object;
  injector?: Injector;
}
