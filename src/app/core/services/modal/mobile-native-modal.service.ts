import { Component, Inject, Injectable, Provider, HostBinding } from '@angular/core';
import {
  AbstractTuiDialogService,
  TuiDestroyService,
  TuiDialog,
  TuiSwipe,
  TuiSwipeModule,
  TUI_DIALOGS
} from '@taiga-ui/cdk';
import {
  PolymorpheusComponent,
  PolymorpheusModule,
  POLYMORPHEUS_CONTEXT
} from '@tinkoff/ng-polymorpheus';
import { InlineSVGModule } from 'ng-inline-svg-2';
import { Observable, Subject, takeUntil } from 'rxjs';

interface IMobileNativeOptions {
  size: 'fullscreen' | 'l';
  data: {
    formType: 'from' | 'to';
    idPrefix: string;
  };
  forceChangeSize$: Observable<'expand' | 'collapse'>;
}

enum ModalStates {
  OPENED = 5,
  COLLAPSED = 40
}

@Component({
  template: `
    <div class="mobile-native-backdrop" (click)="close()"></div>
    <div class="mobile-native-content">
      <div class="mobile-native-chevron" (tuiSwipe)="onSwipe($event)" (click)="toggle()">
        <div
          [inlineSVG]="'assets/images/mobile-modal-chevron.svg'"
          [class.mobile-native-chevron--rotated]="state === ModalStates.COLLAPSED"
        ></div>
      </div>
      <div polymorpheus-outlet [content]="context.content" [context]="context"></div>
    </div>
  `,
  styles: [
    `
      :host {
        position: fixed;
        width: 100%;
        height: 100%;
        background-color: #222425;
        border-radius: 20px 20px 0;
        transition-duration: 0.3s;
      }

      .mobile-native-content {
        position: relative;
        z-index: 999999;
      }

      .mobile-native-backdrop {
        position: fixed;
        inset: 0 0 0 0;
      }

      .mobile-native-chevron {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 1rem 1rem 0;
      }
      .mobile-native-chevron--rotated {
        transform: rotate(180deg);
      }
    `
  ],
  standalone: true,
  imports: [PolymorpheusModule, InlineSVGModule, TuiSwipeModule]
})
export class MobileNativeModalComponent {
  public state = ModalStates.OPENED;

  public ModalStates = ModalStates;

  @HostBinding('style.top') get bottom(): string {
    return `${this.state}%`;
  }

  constructor(
    @Inject(POLYMORPHEUS_CONTEXT)
    readonly context: TuiDialog<IMobileNativeOptions, boolean>,
    private readonly destroy$: TuiDestroyService
  ) {
    if (this.context.forceChangeSize$) {
      // eslint-disable-next-line rxjs-angular/prefer-async-pipe
      this.context.forceChangeSize$.pipe(takeUntil(this.destroy$)).subscribe(state => {
        if (state === 'expand') {
          this.state = ModalStates.OPENED;
        }
      });
    }
  }

  toggle(): void {
    if (this.state === ModalStates.COLLAPSED) {
      this.state = ModalStates.OPENED;
    } else {
      this.state = ModalStates.COLLAPSED;
    }
  }

  close(): void {
    this.context.completeWith(false);
  }

  onSwipe(swipe: TuiSwipe): void {
    if (swipe.direction === 'top' && this.state === ModalStates.COLLAPSED) {
      this.state = ModalStates.OPENED;
    } else if (swipe.direction === 'bottom' && this.state === ModalStates.OPENED) {
      this.state = ModalStates.COLLAPSED;
    } else if (swipe.direction === 'bottom' && this.state === ModalStates.COLLAPSED) {
      this.close();
    }
  }
}

@Injectable({
  providedIn: 'root'
})
export class MobileNativeModalService extends AbstractTuiDialogService<IMobileNativeOptions> {
  private readonly _forceChangeSize$ = new Subject<'expand' | 'collapse'>();

  public readonly forceChangeSize$ = this._forceChangeSize$.asObservable();

  protected defaultOptions: IMobileNativeOptions = {
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

export const MOBILE_NATIVE_MODAL_PROVIDER: Provider = {
  provide: TUI_DIALOGS,
  useExisting: MobileNativeModalService,
  multi: true
};
