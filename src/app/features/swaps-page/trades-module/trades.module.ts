import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TradesFormComponent } from './components/trades-form/trades-form.component';
import { TradeInProgressModalComponent } from './components/trade-in-progress-modal/trade-in-progress-modal.component';
import { TradeSuccessModalComponent } from './components/trade-success-modal/trade-success-modal.component';
import { SharedModule } from '../../../shared/shared.module';

@NgModule({
  declarations: [TradesFormComponent, TradeInProgressModalComponent, TradeSuccessModalComponent],
  imports: [CommonModule, SharedModule],
  exports: [TradesFormComponent, TradeInProgressModalComponent, TradeSuccessModalComponent]
})
export class TradesModule {}
