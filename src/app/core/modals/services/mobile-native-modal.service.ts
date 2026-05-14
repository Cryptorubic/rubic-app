import { Injectable, Injector, Type } from '@angular/core';
import { TuiPopoverService } from '@taiga-ui/cdk';
import { TUI_DIALOGS } from '@taiga-ui/core';
import { Subject } from 'rxjs';
import { MobileNativeModalComponent } from '../components/mobile-native-modal/mobile-native-modal.component';
import { IMobileNativeOptions, INextModal } from '../models/mobile-native-options';

@Injectable({
  providedIn: 'root',
  useFactory: () => new MobileNativeModalService()
})
export class MobileNativeModalService extends TuiPopoverService<IMobileNativeOptions> {
  private readonly _forceClose$ = new Subject<void>();

  public readonly forceClose$ = this._forceClose$.asObservable();

  private readonly _nextModal$ = new Subject<INextModal>();

  public readonly nextModal$ = this._nextModal$.asObservable();

  constructor() {
    super(TUI_DIALOGS, MobileNativeModalComponent);
  }

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
  public openNextModal(component: Type<object>, data: object, injector?: Injector): void {
    this._nextModal$.next({
      component,
      ...data,
      injector
    });
  }
}
