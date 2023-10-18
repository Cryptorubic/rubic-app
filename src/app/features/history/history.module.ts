import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HistoryViewComponent } from './components/history-view/history-view.component';
import { HistoryRoutingModule } from '@features/history/history-routing.module';
import { SharedModule } from '@shared/shared.module';
import { HistoryHeaderComponent } from './components/hisory-header/history-header.component';
import { TuiTabsModule } from '@taiga-ui/kit';
import { TuiSvgModule } from '@taiga-ui/core';
import { InlineSVGModule } from 'ng-inline-svg-2';

@NgModule({
  declarations: [HistoryViewComponent, HistoryHeaderComponent],
  imports: [
    CommonModule,
    HistoryRoutingModule,
    SharedModule,
    TuiTabsModule,
    TuiSvgModule,
    InlineSVGModule
  ]
})
export class HistoryModule {}
