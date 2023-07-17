import {
  Component,
  ChangeDetectionStrategy,
  Inject,
  AfterViewInit,
  OnDestroy
} from '@angular/core';
import { TuiDialogContext } from '@taiga-ui/core';
import { POLYMORPHEUS_CONTEXT } from '@tinkoff/ng-polymorpheus';

@Component({
  selector: 'polymorpheus-success-withdraw-modal',
  templateUrl: './success-withdraw-modal.component.html',
  styleUrls: ['./success-withdraw-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SuccessWithdrawModalComponent implements AfterViewInit, OnDestroy {
  public points: number;

  constructor(
    @Inject(POLYMORPHEUS_CONTEXT)
    private readonly context: TuiDialogContext<boolean, { points: number }>
  ) {
    this.points = context.data.points;
  }

  ngAfterViewInit(): void {
    SuccessWithdrawModalComponent.toggleConfettiBackground('show');
  }

  ngOnDestroy(): void {
    SuccessWithdrawModalComponent.toggleConfettiBackground('remove');
  }

  private static toggleConfettiBackground(action: 'show' | 'remove'): void {
    const overlay = document.querySelector('.t-overlay');

    if (action === 'show') {
      overlay.classList.add('t-overlay-it-confetti');
    }

    if (action === 'remove') {
      overlay.classList.remove('t-overlay-it-confetti');
    }
  }

  public onConfirm(): void {
    this.context.completeWith(null);
  }
}
