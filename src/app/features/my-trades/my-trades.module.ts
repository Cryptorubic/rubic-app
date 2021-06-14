import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MyTradesRoutingModule } from 'src/app/features/my-trades/my-trades-routing.module';
import { TuiTableModule } from '@taiga-ui/addon-table';
import { MyTradesComponent } from './components/my-trades/my-trades.component';

@NgModule({
  declarations: [MyTradesComponent],
  imports: [CommonModule, MyTradesRoutingModule, TuiTableModule]
})
export class MyTradesModule {}
