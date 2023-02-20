import { Injectable, Injector, Type, Component } from '@angular/core';
import { AbstractTuiDialogService } from '@taiga-ui/cdk';
import { PolymorpheusComponent } from '@tinkoff/ng-polymorpheus';
import { Subject } from 'rxjs';
import { MobileNativeModalComponent } from '../components/mobile-native-modal/mobile-native-modal.component';
import { IMobileNativeOptions, INextModal } from '../models/mobile-native-options';

@Injectable({
  providedIn: 'root'
})
export class MobileNativeModalService extends AbstractTuiDialogService<IMobileNativeOptions> {
  private readonly _forceClose$ = new Subject<void>();

  public readonly forceClose$ = this._forceClose$.asObservable();

  private readonly _nextModal$ = new Subject<INextModal>();

  public readonly nextModal$ = this._nextModal$.asObservable();

  protected defaultOptions: IMobileNativeOptions = {
    forceClose$: this.forceClose$,
    nextModal$: this.nextModal$
  } as const;

  readonly component = new PolymorpheusComponent(MobileNativeModalComponent);

  /**
   * Force close opened modal dialog.
   */
  public forceClose(): void {
    this._forceClose$.next();
  }

  /**
   * Open Next Modal from current Modal.
   * @param component Next Modal Component
   * @param data Next Modal data
   * @param injector Next Modal injector
   */
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
