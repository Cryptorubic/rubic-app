import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/shared/shared.module';
import { CrossChainRoutingBottomFormComponent } from 'src/app/features/cross-chain-routing/components/cross-chain-routing-bottom-form/cross-chain-routing-bottom-form.component';

@NgModule({
  declarations: [CrossChainRoutingBottomFormComponent],
  imports: [CommonModule, SharedModule],
  exports: [CrossChainRoutingBottomFormComponent]
})
export class CrossChainRoutingModule {}
