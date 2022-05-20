import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MyTradesV2Component } from './components/my-trades-v2.component';
import { MyTradesv2RoutingModule } from './my-trades-v2.routing.module';
import { MyTradesV2Service } from './services/my-trades-v2.service';

@NgModule({
  declarations: [MyTradesV2Component],
  imports: [CommonModule, MyTradesv2RoutingModule],
  exports: [],
  providers: [MyTradesV2Service]
})
export class MyTradesv2Module {}
