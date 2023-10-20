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
  @Input({ required: true }) deposits: Deposit[];

  @Input({ required: true }) total: TableTotal;

  @Input({ required: true }) claimingId: string;

  @Input({ required: true }) withdrawingId: string;

  @Input({ required: true }) isDarkTheme: boolean;

  @Output() onClaim = new EventEmitter<Deposit>();

  @Output() onWithdraw = new EventEmitter<Deposit>();

  public index = 0;

  public trackBy(index: number, _: Deposit): number {
    return index;
  }
}
