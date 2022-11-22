import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RecentCrosschainTxComponent } from './components/recent-crosschain-tx/recent-crosschain-tx.component';
import { RecentTradesService } from './services/recent-trades.service';
import { TuiLoaderModule } from '@taiga-ui/core';
import { SharedModule } from '@app/shared/shared.module';
import { TranslateModule } from '@ngx-translate/core';
import { TradeRowComponent } from './components/trade-row/trade-row.component';

@NgModule({
  declarations: [RecentCrosschainTxComponent, TradeRowComponent],
  imports: [CommonModule, TuiLoaderModule, SharedModule, TranslateModule],
  exports: [RecentCrosschainTxComponent],
  providers: [RecentTradesService]
})
export class RecentTradesModule {}
