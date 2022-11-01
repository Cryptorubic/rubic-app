import { Component, ChangeDetectionStrategy, Output, EventEmitter } from '@angular/core';
import { SwapButtonContainerService } from '@features/swaps/shared/components/swap-button-container/services/swap-button-container.service';
import { ApproveSwapButtonService } from '@features/swaps/shared/components/swap-button-container/services/approve-swap-button.service';

@Component({
  selector: 'app-approve-button',
  templateUrl: './approve-button.component.html',
  styleUrls: ['./approve-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ApproveButtonComponent {
  @Output() readonly onClick = new EventEmitter<void>();

  public readonly idPrefix = this.swapButtonContainerService.idPrefix;

  public readonly approveButtonLoading$ = this.approveSwapButtonService.approveButtonLoading$;

  public readonly approveButtonDisabled$ = this.approveSwapButtonService.approveButtonDisabled$;

  constructor(
    private readonly swapButtonContainerService: SwapButtonContainerService,
    private readonly approveSwapButtonService: ApproveSwapButtonService
  ) {}
}
