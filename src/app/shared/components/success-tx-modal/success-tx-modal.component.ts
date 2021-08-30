import { Component, ChangeDetectionStrategy, Inject, OnInit } from '@angular/core';
import { TuiDialogContext } from '@taiga-ui/core';
import { POLYMORPHEUS_CONTEXT } from '@tinkoff/ng-polymorpheus';
import { Subscription, timer } from 'rxjs';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { first, takeUntil } from 'rxjs/operators';
import { modalConfig } from 'src/app/shared/constants/modals/modal-config';

@Component({
  selector: 'app-success-tx-modal',
  templateUrl: './success-tx-modal.component.html',
  styleUrls: ['./success-tx-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SuccessTxModalComponent implements OnInit {
  public idPrefix: string;

  constructor(
    @Inject(POLYMORPHEUS_CONTEXT)
    private readonly context: TuiDialogContext<boolean, { idPrefix: string }>
  ) {
    this.idPrefix = context.data.idPrefix;
  }

  public ngOnInit(): void {
    /* timer(modalConfig.modalLifetime)
      .pipe(first())
      .subscribe(() => this.onConfirm()); */
  }

  public onConfirm(): void {
    this.context.completeWith(null);
  }
}
