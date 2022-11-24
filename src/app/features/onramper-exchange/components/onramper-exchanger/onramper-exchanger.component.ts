import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SwapFormService } from '@features/swaps/core/services/swap-form-service/swap-form.service';

@Component({
  selector: 'app-onramper-exchanger',
  templateUrl: './onramper-exchanger.component.html',
  styleUrls: ['./onramper-exchanger.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OnramperExchangerComponent {
  constructor(public readonly swapFormService: SwapFormService) {}
}
