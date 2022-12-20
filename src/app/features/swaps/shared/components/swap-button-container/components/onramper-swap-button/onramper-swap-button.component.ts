import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { SwapFormService } from '@core/services/swaps/swap-form.service';
import { map } from 'rxjs/operators';
import { EvmWeb3Pure } from 'rubic-sdk';

@Component({
  selector: 'app-onramper-swap-button',
  templateUrl: './onramper-swap-button.component.html',
  styleUrls: ['./onramper-swap-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OnramperSwapButtonComponent {
  @Output() readonly onBuyNativeClick = new EventEmitter<void>();

  @Output() readonly onSwapClick = new EventEmitter<void>();

  @Input() buttonText: string;

  public readonly isToTokenNative$ = this.swapFormService.toToken$.pipe(
    map(toToken => EvmWeb3Pure.isNativeAddress(toToken.address))
  );

  constructor(private readonly swapFormService: SwapFormService) {}
}
