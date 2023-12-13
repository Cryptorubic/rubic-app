import { ChangeDetectionStrategy, Component, EventEmitter, Output } from '@angular/core';
import { SwapsFormService } from '../../services/swaps-form/swaps-form.service';

@Component({
  selector: 'app-receiver-address-button',
  templateUrl: './receiver-address-button.component.html',
  styleUrls: ['./receiver-address-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReceiverAddressButtonComponent {
  @Output() handleClick = new EventEmitter<void>();

  public toBlockchain$ = this.swapFormService.toBlockchain$;

  constructor(private swapFormService: SwapsFormService) {}
}
