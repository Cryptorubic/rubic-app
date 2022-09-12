import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { Deposit } from '../../models/deposit.inteface';
import { TableTotal } from '../../models/table-total.interface';
import BigNumber from 'bignumber.js';
import { WithRoundPipe } from '@app/shared/pipes/with-round.pipe';

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

  public trackBy(index: number, _: Deposit): number {
    return index;
  }

  public getTotalNftRewards(id: number): BigNumber | string {
    const totalNftRewards = this.deposits[id].totalNftRewards;

    if (totalNftRewards.isZero()) {
      return '0.00';
    }

    if (totalNftRewards.lt(0.01)) {
      return '< 0.01';
    }

    return new WithRoundPipe().transform(totalNftRewards.toString(), 'fixedValue', { decimals: 2 });
  }
}
