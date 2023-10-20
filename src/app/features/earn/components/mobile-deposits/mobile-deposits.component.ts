import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { Deposit } from '../../models/deposit.inteface';
import { TableTotal } from '../../models/table-total.interface';

@Component({
  selector: 'app-mobile-deposits',
  templateUrl: './mobile-deposits.component.html',
  styleUrls: ['./mobile-deposits.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MobileDepositsComponent {
  @Input() deposits: Deposit[];

  @Input() total: TableTotal;

  @Input() claimingId: string;

  @Input() withdrawingId: string;

  @Input() isDarkTheme: boolean;

  @Output() onClaim = new EventEmitter<Deposit>();

  @Output() onWithdraw = new EventEmitter<Deposit>();

  public index = 0;

  public trackBy(index: number, _: Deposit): number {
    return index;
  }
}
