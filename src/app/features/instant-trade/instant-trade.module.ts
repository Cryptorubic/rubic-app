import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/shared/shared.module';
import { InstantTradeBottomFormComponent } from './components/instant-trade-bottom-form/instant-trade-bottom-form.component';
import { InstantTradesSwapProviderService } from './services/instant-trades-swap-provider-service/instant-trades-swap-provider.service';

@NgModule({
  declarations: [InstantTradeBottomFormComponent],
  exports: [InstantTradeBottomFormComponent],
  imports: [CommonModule, SharedModule],
  providers: [InstantTradesSwapProviderService]
})
export class InstantTradeModule {}
