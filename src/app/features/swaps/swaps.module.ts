import { NgModule } from '@angular/core';
import { SwapsFormModule } from '@features/swaps/features/swaps-form/swaps-form.module';
import { SwapsRoutingModule } from '@features/swaps/swaps-routing.module';

@NgModule({
  imports: [SwapsRoutingModule, SwapsFormModule]
})
export class SwapsModule {}
