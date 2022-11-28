import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SwapFormService } from '@features/swaps/core/services/swap-form-service/swap-form.service';

@Component({
  selector: 'app-exchanger-form',
  templateUrl: './exchanger-form.component.html',
  styleUrls: ['./exchanger-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExchangerFormComponent {
  constructor(public readonly swapFormService: SwapFormService) {}
}
