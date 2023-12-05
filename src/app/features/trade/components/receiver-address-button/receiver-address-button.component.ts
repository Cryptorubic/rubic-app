import { ChangeDetectionStrategy, Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-receiver-address-button',
  templateUrl: './receiver-address-button.component.html',
  styleUrls: ['./receiver-address-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReceiverAddressButtonComponent {
  @Output() handleClick = new EventEmitter<void>();
}
