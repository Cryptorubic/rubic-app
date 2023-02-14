import { ChangeDetectionStrategy, Component, HostBinding, Inject } from '@angular/core';
import { TuiDestroyService, TuiDialog, TuiSwipe } from '@taiga-ui/cdk';
import { POLYMORPHEUS_CONTEXT } from '@tinkoff/ng-polymorpheus';
import { ModalStates } from '../../models/modal-states.enum';
import { takeUntil } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-mobile-native-modal',
  templateUrl: './mobile-native-modal.component.html',
  styleUrls: ['./mobile-native-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MobileNativeModalComponent {
  public title: string = this.context.title;

  public state = ModalStates.OPENED;

  public ModalStates = ModalStates;

  @HostBinding('style.top') get top(): string {
    return this.context.fitContent ? 'unset' : `${this.state}%`;
  }

  @HostBinding('class.fit-content') fitContent: boolean = this.context.fitContent;

  constructor(
    @Inject(POLYMORPHEUS_CONTEXT)
    readonly context: TuiDialog<
      { title: string; fitContent?: boolean; forceChangeSize$: Observable<string> },
      boolean
    >,
    private readonly destroy$: TuiDestroyService
  ) {
    if (this.context.forceChangeSize$) {
      // eslint-disable-next-line rxjs-angular/prefer-async-pipe
      this.context.forceChangeSize$.pipe(takeUntil(this.destroy$)).subscribe((state: string) => {
        if (state === 'expand') {
          this.state = ModalStates.OPENED;
        }
      });
    }
  }

  toggle(): void {
    if (this.context.fitContent) {
      this.close();
    }

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
