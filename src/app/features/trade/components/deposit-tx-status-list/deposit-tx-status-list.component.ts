import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { DepositStatusHandler } from '../deposit-preview-swap/abstract/deposit-status-handler';

@Component({
  selector: 'app-deposit-tx-status-list',
  templateUrl: './deposit-tx-status-list.component.html',
  styleUrls: ['./deposit-tx-status-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DepositTxStatusListComponent {
  @Input({ required: true }) statusHandlerChain: DepositStatusHandler[];
}
