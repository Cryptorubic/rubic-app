import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RecentCrosschainTxComponent } from './components/recent-crosschain-tx/recent-crosschain-tx.component';
import { RecentTradesService } from './services/recent-trades.service';
import { TuiHintModule, TuiLoaderModule, TuiScrollbarModule } from '@taiga-ui/core';
import { SharedModule } from '@app/shared/shared.module';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [RecentCrosschainTxComponent],
  imports: [
    CommonModule,
    TuiLoaderModule,
    SharedModule,
    TranslateModule,
    TuiHintModule,
    TuiHintModule,
    TuiScrollbarModule
  ],
  exports: [RecentCrosschainTxComponent],
  providers: [RecentTradesService]
})
export class RecentTradesModule {}
