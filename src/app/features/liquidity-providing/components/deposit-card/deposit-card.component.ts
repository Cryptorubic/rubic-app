import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { HeaderStore } from '@app/core/header/services/header.store';
import { TokenLpParsed } from '../../models/token-lp.interface';

@Component({
  selector: 'app-deposit-card',
  templateUrl: './deposit-card.component.html',
  styleUrls: ['./deposit-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DepositCardComponent {
  @Input() deposit: TokenLpParsed;

  @Input() loading: boolean;

  @Output() onCollectRewards = new EventEmitter<void>();

  @Output() onRequestWithdraw = new EventEmitter<void>();

  @Output() onWithdraw = new EventEmitter<void>();

  public readonly isMobile$ = this.headerStore.getMobileDisplayStatus();

  constructor(private readonly headerStore: HeaderStore) {}
}
