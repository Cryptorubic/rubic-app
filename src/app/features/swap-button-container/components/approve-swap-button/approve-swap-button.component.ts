import { Component, ChangeDetectionStrategy, Output, EventEmitter } from '@angular/core';
import { ApproveSwapButtonService } from '@features/swap-button-container/services/approve-swap-button.service';

@Component({
  selector: 'app-approve-swap-button',
  templateUrl: './approve-swap-button.component.html',
  styleUrls: ['./approve-swap-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ApproveSwapButtonComponent {
  @Output() readonly onApproveClick = new EventEmitter<void>();

  @Output() readonly onSwapClick = new EventEmitter<void>();

  public readonly approveIndicatorDisabled$ =
    this.approveSwapButtonService.approveIndicatorDisabled$;

  public readonly swapIndicatorDisabled$ = this.approveSwapButtonService.swapIndicatorDisabled$;

  constructor(private readonly approveSwapButtonService: ApproveSwapButtonService) {}
}
