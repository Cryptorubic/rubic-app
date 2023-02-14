import { Injectable } from '@angular/core';
import { AbstractTuiDialogService } from '@taiga-ui/cdk';
import { PolymorpheusComponent } from '@tinkoff/ng-polymorpheus';
import { Observable, Subject } from 'rxjs';
import { MobileNativeModalComponent } from '../components/mobile-native-modal/mobile-native-modal.component';
import { IMobileNativeOptions } from '../models/mobile-native-options';

@Injectable({
  providedIn: 'root'
})
export class MobileNativeModalService extends AbstractTuiDialogService<IMobileNativeOptions> {
  private readonly _forceChangeSize$ = new Subject<'expand' | 'collapse'>();

  public readonly forceChangeSize$ = this._forceChangeSize$.asObservable();

  protected defaultOptions: {
    title: string;
    size: string;
    data: { formType: string; idPrefix: string };
    forceChangeSize$: Observable<'expand' | 'collapse'>;
  } = {
    title: '',
    size: 'l',
    data: {
      formType: 'from',
      idPrefix: ''
    },
    forceChangeSize$: this.forceChangeSize$
  } as const;

  readonly component = new PolymorpheusComponent(MobileNativeModalComponent);

  forceChangeSize(size: 'expand' | 'collapse'): void {
    this._forceChangeSize$.next(size);
  }
}
