import { ChangeDetectionStrategy, Component, Output, EventEmitter, Input } from '@angular/core';
import { LpError } from '../../models/lp-error.enum';

@Component({
  selector: 'app-stake-button',
  templateUrl: './stake-button.component.html',
  styleUrls: ['./stake-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StakeButtonComponent {
  @Input() needLogin: boolean;

  @Input() error: LpError;

  @Output() onLogin = new EventEmitter<void>();

  @Output() onApprove = new EventEmitter<void>();

  @Output() onStake = new EventEmitter<void>();

  public readonly errors = LpError;

  constructor() {}
}
