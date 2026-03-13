import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { PrivateProviderInfoUI } from '../../models/provider-info';
import { PrivateTradeType } from '../../constants/private-trade-types';

@Component({
  selector: 'app-private-provider-element',
  templateUrl: './private-provider-element.component.html',
  styleUrls: ['./private-provider-element.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PrivateProviderElementComponent {
  @Input({ required: true }) providerInfo: PrivateProviderInfoUI;

  @Output() providerSelected: EventEmitter<PrivateTradeType> = new EventEmitter();

  public readonly starsCount = Array.from({ length: 4 }, (_, i) => i + 1);

  public handleClick(): void {
    this.providerSelected.emit(this.providerInfo.name);
  }
}
