import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/shared/shared.module';
import { InstantTradeBottomFormComponent } from './components/instant-trade-bottom-form/instant-trade-bottom-form.component';

@NgModule({
  declarations: [InstantTradeBottomFormComponent],
  exports: [InstantTradeBottomFormComponent],
  imports: [CommonModule, SharedModule],
  providers: []
})
export class InstantTradeModule {}
