import { Injector, Component, Type } from '@angular/core';
import { Observable } from 'rxjs';

export interface IMobileNativeOptions {
  title?: string;
  data?: object;
  fitContent?: boolean;
  scrollableContent?: boolean;
  forceClose$?: Observable<void>;
  nextModal$?: Observable<INextModal>;
  previousComponent?: boolean;
}

export interface INextModal extends IMobileNativeOptions {
  component?: Type<Component & object>;
  data?: object;
  injector?: Injector;
}
