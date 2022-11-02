import { Component, ChangeDetectionStrategy, Output, EventEmitter } from '@angular/core';
import { TradeService } from '@features/swaps/core/services/trade-service/trade.service';

@Component({
  selector: 'app-update-rate-button',
  templateUrl: './update-rate-button.component.html',
  styleUrls: ['./update-rate-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UpdateRateButtonComponent {
  @Output() readonly onClick = new EventEmitter<void>();

  constructor(private readonly tradeService: TradeService) {}

  public onHoveredChange(isHovered: boolean): void {
    this.tradeService.isButtonHovered = isHovered;
  }
}
