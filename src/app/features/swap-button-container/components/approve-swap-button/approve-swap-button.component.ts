import { Component, ChangeDetectionStrategy, Output, EventEmitter } from '@angular/core';
import { ApproveSwapButtonService } from '@features/swap-button-container/services/approve-swap-button.service';

@Component({
  selector: 'app-approve-swap-button',
  templateUrl: './approve-swap-button.component.html',
  styleUrls: ['./approve-swap-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ApproveSwapButtonComponent {
  @Output() onApproveClick = new EventEmitter<void>();

  @Output() onSwapClick = new EventEmitter<void>();

  public readonly firstItemDisabled$ = this.approveSwapButtonService.firstItemDisabled$;

  public readonly secondItemDisabled$ = this.approveSwapButtonService.secondItemDisabled$;

  constructor(private readonly approveSwapButtonService: ApproveSwapButtonService) {}
}
