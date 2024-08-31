import { ChangeDetectionStrategy, EventEmitter, Component, Output, Input } from '@angular/core';
import { StakeButtonError } from '../../models/stake-button-error.enum';

@Component({
  selector: 'app-stake-button',
  templateUrl: './stake-button.component.html',
  styleUrls: ['./stake-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StakeButtonComponent {
  @Input() stakeLoading: boolean = false;

  @Input() approveLoading: boolean = false;

  @Input() amountError: StakeButtonError;

  @Input() lockTimeExceededError: boolean;

  @Input() minStakeAmount: number;

  @Input() maxLockTime: number;

  @Output() public readonly onStake = new EventEmitter<void>();

  @Output() public readonly onApprove = new EventEmitter<void>();

  public readonly errors = StakeButtonError;

  public handleClick(): void {
    /**
    if (this.amountError === this.errors.NULL) {
      this.onStake.emit();
    }

    if (this.amountError === this.errors.NEED_APPROVE) {
      this.onApprove.emit();
    }
    */
  }
}
