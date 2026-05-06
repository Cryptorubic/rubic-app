import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Inject,
  OnDestroy,
  OnInit,
  DestroyRef,
  inject
} from '@angular/core';
import { TuiPortalContext } from '@taiga-ui/cdk/portals';
import { TuiSwipeEvent } from '@taiga-ui/cdk/directives/swipe';
import { POLYMORPHEUS_CONTEXT } from '@taiga-ui/polymorpheus';
import { ModalStates } from '../../models/modal-states.enum';
import { delay, tap } from 'rxjs/operators';
import { switchMap } from 'rxjs';
import { ModalService } from '../../services/modal.service';
import { IMobileNativeOptions } from '../../models/mobile-native-options';
import { animationTimeout } from '../../utils/animation-timeout';
import { DOCUMENT } from '@angular/common';
import { IframeService } from '@core/services/iframe-service/iframe.service';

@Component({
  selector: 'app-mobile-native-modal',
  templateUrl: './mobile-native-modal.component.html',
  styleUrls: ['./mobile-native-modal.component.scss'],
  providers: [],
  changeDetection: ChangeDetectionStrategy.Default,
  standalone: false
})
export class MobileNativeModalComponent implements OnInit, OnDestroy {
  public title: string = this.context.title;

  public showMobileMenu: boolean = this.context.showMobileMenu;

  public state: ModalStates;

  public readonly isIframe$ = this.iframeService.isIframe$;

  constructor(
    @Inject(POLYMORPHEUS_CONTEXT)
    readonly context: TuiPortalContext<IMobileNativeOptions, void>,
    private readonly modalService: ModalService,
    private readonly el: ElementRef<HTMLElement>,
    @Inject(DOCUMENT) private readonly document: Document,
    private readonly iframeService: IframeService // private readonly tokensListService: TokensListService
  ) {
    this.subscribeOnModal();
    this.modalService.setModalEl({ elRef: el, context: context });
  }

  ngOnInit(): void {
    animationTimeout(() => this.show());
    this.document.documentElement.style.overflowY = 'hidden';
  }

  ngOnDestroy(): void {
    this.document.documentElement.style.overflowY = 'unset';
  }

  private subscribeOnModal(): void {
    if (this.context.forceClose$) {
      this.subscribeOnForceClose();
    }

    if (this.context.nextModal$) {
      this.subscribeOnNextModal();
    }
  }

  private subscribeOnForceClose(): void {
    this.context.forceClose$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      if (this.state === ModalStates.HIDDEN) {
        this.state = ModalStates.FULL;
        this.show();
      } else {
        this.hide();
        animationTimeout(this.context.completeWith);
      }
    });
  }

  private subscribeOnNextModal(): void {
    this.context.nextModal$
      .pipe(
        tap(() => {
          this.state = ModalStates.HIDDEN;
          this.hide();
        }),
        delay(300),
        switchMap(nextModal =>
          this.modalService.openNextModal(
            nextModal.component,
            {
              title: nextModal.title,
              fitContent: nextModal.fitContent,
              scrollableContent: nextModal.scrollableContent,
              previousComponent: true,
              data: nextModal?.data
            },
            nextModal.injector
          )
        ),
        tap(() => this.show()),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe();
  }

  public toggle(): void {
    if (this.context.fitContent) {
      this.hide();
      animationTimeout(this.context.completeWith);
      return;
    }

    if (this.state === ModalStates.MEDIUM) {
      this.state = ModalStates.FULL;
      this.expand();
    } else {
      this.close();
    }
  }

  public close(): void {
    this.hide();
    animationTimeout(this.context.completeWith);
  }

  public onSwipe(swipe: TuiSwipeEvent, title: string, place: string): void {
    if (
      swipe.direction === 'top' &&
      this.state === ModalStates.MEDIUM &&
      !this.context.fitContent
    ) {
      this.state = ModalStates.FULL;
      this.expand();
    } else if (swipe.direction === 'bottom') {
      if (
        place === 'content' &&
        (title === 'Select Chain and Token' ||
          title === 'Select Blockchain' ||
          title === 'Account' ||
          title === 'Menu' ||
          title === '')
      ) {
        return;
      }

      this.close();
    }
  }

  private hide(): void {
    this.el.nativeElement.classList.add('hidden');
    this.el.nativeElement.classList.remove('opened');
    this.el.nativeElement.classList.remove('collapsed');
  }

  private show(): void {
    this.el.nativeElement.classList.remove('hidden');
    if (this.context.fitContent) {
      this.state = ModalStates.MEDIUM;
      this.el.nativeElement.classList.add('fit-content');
    } else {
      this.state = ModalStates.FULL;
      this.el.nativeElement.classList.add('opened');
    }
    if (this.context.scrollableContent) {
      this.el.nativeElement.classList.add('scrollable-content');
    }
  }

  private collapse(): void {
    this.el.nativeElement.classList.add('collapsed');
    this.el.nativeElement.classList.remove('opened');
  }

  private expand(): void {
    this.el.nativeElement.classList.remove('collapsed');
    this.el.nativeElement.classList.add('opened');
  }

  readonly destroyRef = inject(DestroyRef);
}
