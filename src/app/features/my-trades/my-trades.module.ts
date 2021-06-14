import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MyTradesRoutingModule } from 'src/app/features/my-trades/my-trades-routing.module';
import { TuiTableModule, TuiTablePaginationModule } from '@taiga-ui/addon-table';
import { TuiLoaderModule } from '@taiga-ui/core';
import { TuiLetModule } from '@taiga-ui/cdk';
import { InlineSVGModule } from 'ng-inline-svg';
import { MyTradesComponent } from './components/my-trades/my-trades.component';

@NgModule({
  declarations: [MyTradesComponent],
  imports: [
    CommonModule,
    MyTradesRoutingModule,
    TuiTableModule,
    TuiLoaderModule,
    TuiLetModule,
    TuiTablePaginationModule,
    InlineSVGModule
  ]
})
export class MyTradesModule {}
