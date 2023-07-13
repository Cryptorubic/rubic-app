import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChangenowRecentTradesRoutingModule } from '@features/changenow-recent-trades/changenow-recent-trades-routing.module';
import { ChangenowRecentTradesComponent } from '@features/changenow-recent-trades/components/changenow-recent-trades/changenow-recent-trades.component';
import { SharedModule } from '@shared/shared.module';
import { TuiHintModule, TuiLoaderModule } from '@taiga-ui/core';
import { TranslateModule } from '@ngx-translate/core';
import { RecentTradesService } from '@core/recent-trades/services/recent-trades.service';

@NgModule({
  declarations: [ChangenowRecentTradesComponent],
  imports: [
    CommonModule,
    ChangenowRecentTradesRoutingModule,
    SharedModule,
    TranslateModule,
    TuiLoaderModule,
    TuiHintModule,
    TuiHintModule
  ],
  providers: [RecentTradesService]
})
export class ChangenowRecentTradesModuleModule {}
