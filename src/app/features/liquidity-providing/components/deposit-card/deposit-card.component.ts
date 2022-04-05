import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { TokenLpParsed } from '../../models/token-lp.interface';

@Component({
  selector: 'app-deposit-card',
  templateUrl: './deposit-card.component.html',
  styleUrls: ['./deposit-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DepositCardComponent {
  @Input()
  deposit: TokenLpParsed;

  @Input()
  loading: boolean;

  @Output()
  onCollectRewards = new EventEmitter<void>();

  @Output()
  onRequestWithdraw = new EventEmitter<void>();

  @Output()
  onWithdraw = new EventEmitter<void>();

  constructor() {}
}
