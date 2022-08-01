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

  @Input() error: StakeButtonError;

  @Output() public readonly onStake = new EventEmitter<void>();

  public readonly errors = StakeButtonError;

  constructor() {}
}
