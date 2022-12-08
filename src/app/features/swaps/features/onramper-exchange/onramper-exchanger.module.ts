import { NgModule } from '@angular/core';
import { SharedModule } from '@shared/shared.module';
import { SwapsSharedModule } from '@features/swaps/shared/swaps-shared.module';
import { CommonModule } from '@angular/common';
import { OnramperBottomFormComponent } from '@features/swaps/features/onramper-exchange/components/onramper-bottom-form/onramper-bottom-form.component';
import { OnramperWidgetComponent } from '@features/swaps/features/onramper-exchange/components/onramper-widget/onramper-widget.component';

@NgModule({
  declarations: [OnramperBottomFormComponent, OnramperWidgetComponent],
  exports: [OnramperBottomFormComponent, OnramperWidgetComponent],
  imports: [CommonModule, SharedModule, SwapsSharedModule]
})
export class OnramperExchangerModule {}
