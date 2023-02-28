import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChangenowRecentTradesRoutingModule } from '@features/changenow-recent-trades/changenow-recent-trades-routing.module';
import { ChangenowRecentTradesComponent } from '@features/changenow-recent-trades/components/changenow-recent-trades/changenow-recent-trades.component';
import { RecentTradesModule } from '@core/recent-trades/recent-trades.module';

@NgModule({
  declarations: [ChangenowRecentTradesComponent],
  imports: [CommonModule, ChangenowRecentTradesRoutingModule, RecentTradesModule]
})
export class ChangenowRecentTradesModuleModule {}
