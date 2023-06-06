import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { OnramperFormCalculationService } from '@features/swaps/features/onramper-exchange/services/onramper-form-calculation.service';

@Component({
  selector: 'app-onramper-swap-button',
  templateUrl: './onramper-swap-button.component.html',
  styleUrls: ['./onramper-swap-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OnramperSwapButtonComponent {
  @Output() readonly handleDirectBuy = new EventEmitter<void>();

  @Output() readonly onSwapClick = new EventEmitter<void>();

  @Input() buttonText: string;

  public readonly isDirectBuy$ = this.onramperFormCalculationService.isDirectSwap$;

  constructor(private readonly onramperFormCalculationService: OnramperFormCalculationService) {}
}
