import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RecentTradesService } from './services/recent-trades.service';
import { TuiHintModule, TuiLoaderModule, TuiScrollbarModule } from '@taiga-ui/core';
import { SharedModule } from '@app/shared/shared.module';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    TuiLoaderModule,
    SharedModule,
    TranslateModule,
    TuiHintModule,
    TuiHintModule,
    TuiScrollbarModule
  ],
  exports: [],
  providers: [RecentTradesService]
})
export class RecentTradesModule {}
