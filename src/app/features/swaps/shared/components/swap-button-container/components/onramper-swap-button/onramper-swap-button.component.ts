import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

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
}
