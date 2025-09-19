import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-transaction-details-element',
  templateUrl: './transaction-details-element.component.html',
  styleUrls: ['./transaction-details-element.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TransactionDetailsElementComponent {
  @Input() public title: string;

  @Input() public description: string;

  @Input() public icon: string = 'assets/images/icons/hint.svg';
}
