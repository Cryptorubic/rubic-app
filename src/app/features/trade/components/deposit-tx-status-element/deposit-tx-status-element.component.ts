import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { DepositStatusHandler } from '../deposit-preview-swap/abstract/deposit-status-handler';

@Component({
  selector: 'app-deposit-tx-status-element',
  templateUrl: './deposit-tx-status-element.component.html',
  styleUrls: ['./deposit-tx-status-element.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DepositTxStatusElementComponent {
  @Input({ required: true }) statusHandler: DepositStatusHandler;
}
