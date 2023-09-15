import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-receiver-address-button',
  templateUrl: './receiver-address-button.component.html',
  styleUrls: ['./receiver-address-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReceiverAddressButtonComponent {
  public showReceiverAddress(): void {}
}
