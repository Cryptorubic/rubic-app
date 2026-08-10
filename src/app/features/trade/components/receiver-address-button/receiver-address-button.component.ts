import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-receiver-address-button',
  templateUrl: './receiver-address-button.component.html',
  styleUrls: ['./receiver-address-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReceiverAddressButtonComponent {
  @Input({ required: true }) toBlockchain!: string;

  @Output() handleClick = new EventEmitter<void>();

  constructor() {}
}
