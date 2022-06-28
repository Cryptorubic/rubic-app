import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RecentCrosschainTxComponent } from './components/recent-crosschain-tx/recent-crosschain-tx.component';
import { RecentTradesService } from './services/recent-trades.service';
import { TuiLoaderModule } from '@taiga-ui/core';
import { SharedModule } from '@app/shared/shared.module';
import { CelerTradeComponent } from './components/celer-trade/celer-trade.component';
import { SymbiosisTradeComponent } from './components/symbiosis-trade/symbiosis-trade.component';
import { RubicTradeComponent } from './components/rubic-trade/rubic-trade.component';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    RecentCrosschainTxComponent,
    CelerTradeComponent,
    SymbiosisTradeComponent,
    RubicTradeComponent
  ],
  imports: [CommonModule, TuiLoaderModule, SharedModule, TranslateModule],
  exports: [RecentCrosschainTxComponent],
  providers: [RecentTradesService]
})
export class RecentTradesModule {}
