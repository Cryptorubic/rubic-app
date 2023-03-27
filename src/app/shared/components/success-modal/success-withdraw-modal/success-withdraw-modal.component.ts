import { Component, ChangeDetectionStrategy, Inject, AfterViewInit } from '@angular/core';
import { TuiDialogContext } from '@taiga-ui/core';
import { POLYMORPHEUS_CONTEXT } from '@tinkoff/ng-polymorpheus';

@Component({
  selector: 'polymorpheus-success-withdraw-modal',
  templateUrl: './success-withdraw-modal.component.html',
  styleUrls: ['./success-withdraw-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SuccessWithdrawModalComponent implements AfterViewInit {
  public points: number;

  constructor(
    @Inject(POLYMORPHEUS_CONTEXT)
    private readonly context: TuiDialogContext<boolean, { points: number }>
  ) {
    this.points = context.data.points;
  }

  ngAfterViewInit() {
    const overlay = document.querySelector('.overlay');
    overlay.classList.add('overlay-it-confetti');
  }

  public onConfirm(): void {
    this.context.completeWith(null);
  }
}
