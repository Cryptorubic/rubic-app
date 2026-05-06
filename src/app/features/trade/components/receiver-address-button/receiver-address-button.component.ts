import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { BlockchainName } from '@cryptorubic/core';

@Component({
  selector: 'app-receiver-address-button',
  templateUrl: './receiver-address-button.component.html',
  styleUrls: ['./receiver-address-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false
})
export class ReceiverAddressButtonComponent {
  @Input({ required: true }) toBlockchain: BlockchainName;

  @Output() handleClick = new EventEmitter<void>();

  constructor() {}
}
