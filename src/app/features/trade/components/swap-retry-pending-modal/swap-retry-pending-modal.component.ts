import { ChangeDetectionStrategy, Component, ElementRef, Inject, OnDestroy } from '@angular/core';
import { ModalService } from '@app/core/modals/services/modal.service';
import { TuiDialogContext } from '@taiga-ui/core';
import { POLYMORPHEUS_CONTEXT } from '@tinkoff/ng-polymorpheus';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-swap-retry-pending-modal',
  templateUrl: './swap-retry-pending-modal.component.html',
  styleUrls: ['./swap-retry-pending-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SwapRetryPendingModalComponent implements OnDestroy {
  public readonly backupsCount: number;

  public readonly failedStatesCount$: Observable<number>;

  constructor(
    @Inject(POLYMORPHEUS_CONTEXT)
    private readonly context: TuiDialogContext<
      void,
      { backupsCount: number; failedStatesCount$: Observable<number> }
    >,
    private readonly modalService: ModalService,
    private readonly el: ElementRef<HTMLElement>
  ) {
    this.backupsCount = this.context.data.backupsCount;
    this.failedStatesCount$ = this.context.data.failedStatesCount$;

    this.modalService.setModalEl({ elRef: el, context: context });
  }

  ngOnDestroy(): void {
    this.modalService.setModalEl({ elRef: null, context: null });
  }
}
