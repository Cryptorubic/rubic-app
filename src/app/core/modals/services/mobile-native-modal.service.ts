import { Injectable, Injector, Type, Component } from '@angular/core';
import { TuiPopoverService } from '@taiga-ui/cdk';
import { PolymorpheusContent } from '@taiga-ui/polymorpheus';
import { Subject, Observable } from 'rxjs';
import { TUI_DIALOGS } from '@taiga-ui/core';
import { MobileNativeModalComponent } from '../components/mobile-native-modal/mobile-native-modal.component';
import { IMobileNativeOptions, INextModal } from '../models/mobile-native-options';

@Injectable({
  providedIn: 'root'
})
export class MobileNativeModalService extends TuiPopoverService<IMobileNativeOptions> {
  private readonly _forceClose$ = new Subject<void>();

  public readonly forceClose$ = this._forceClose$.asObservable();

  private readonly _nextModal$ = new Subject<INextModal>();

  public readonly nextModal$ = this._nextModal$.asObservable();

  constructor() {
    super(TUI_DIALOGS, MobileNativeModalComponent);
  }

  override open<G = void>(
    content: PolymorpheusContent<IMobileNativeOptions & object>,
    options: Partial<IMobileNativeOptions> = {}
  ): Observable<G> {
    return super.open(content, {
      forceClose$: this.forceClose$,
      nextModal$: this.nextModal$,
      ...options
    });
  }

  public forceClose(): void {
    this._forceClose$.next();
  }

  public openNextModal(
    component: Type<Component & object>,
    data: object,
    injector?: Injector
  ): void {
    this._nextModal$.next({
      component,
      ...data,
      injector
    });
  }
}
