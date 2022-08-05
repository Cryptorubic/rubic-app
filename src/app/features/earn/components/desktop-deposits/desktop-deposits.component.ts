import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { Deposit } from '../../models/deposit.inteface';
import { TableTotal } from '../../models/table-total.interface';

@Component({
  selector: 'app-desktop-deposits',
  templateUrl: './desktop-deposits.component.html',
  styleUrls: ['./desktop-deposits.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DesktopDepositsComponent {
  @Input() deposits: Deposit[];

  @Input() total: TableTotal;

  @Input() claimingId: string;

  @Input() withdrawingId: string;

  @Input() isDarkTheme: boolean;

  @Output() onClaim = new EventEmitter<Deposit>();

  @Output() onWithdraw = new EventEmitter<Deposit>();
}
