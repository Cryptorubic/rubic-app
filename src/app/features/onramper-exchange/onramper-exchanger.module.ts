import { NgModule } from '@angular/core';
import { OnramperExchangerRoutingModule } from '@features/onramper-exchange/onramper-exchanger-routing.module';
import { OnramperExchangerComponent } from './components/onramper-exchanger/onramper-exchanger.component';
import { SwapsModule } from '@features/swaps/swaps.module';
import { SharedModule } from '@shared/shared.module';
import { SwapsSharedModule } from '@features/swaps/shared/swaps-shared.module';
import { SwapButtonContainerModule } from '@features/swaps/shared/components/swap-button-container/swap-button-container.module';
import { ExchangerFormComponent } from './components/onramper-exchanger/components/exchanger-form/exchanger-form.component';
import { OnramperWidgetComponent } from './components/onramper-exchanger/components/onramper-widget/onramper-widget.component';
import { OnramperToAmountEstimatedComponent } from '@features/onramper-exchange/components/onramper-exchanger/components/exchanger-form/components/token-amount-estimated/onramper-to-amount-estimated.component';
import { CommonModule } from '@angular/common';
import { TokensSelectorModule } from '@features/onramper-exchange/components/onramper-exchanger/components/exchanger-form/components/tokens-selector/tokens-selector.module';
import { SelectTokenButtonComponent } from '@features/onramper-exchange/components/onramper-exchanger/components/exchanger-form/components/select-token-button/select-token-button.component';
import { FiatAmountInputComponent } from '@features/onramper-exchange/components/onramper-exchanger/components/exchanger-form/components/fiat-amount-input/fiat-amount-input.component';
import { ReactiveFormsModule } from '@angular/forms';
import { FiatsSelectorModule } from '@features/onramper-exchange/components/onramper-exchanger/components/exchanger-form/components/fiat-amount-input/components/fiats-selector/fiats-selector.module';
import { SelectFiatButtonComponent } from '@features/onramper-exchange/components/onramper-exchanger/components/exchanger-form/components/fiat-amount-input/components/select-fiat-button/select-fiat-button.component';

@NgModule({
  declarations: [
    OnramperExchangerComponent,
    ExchangerFormComponent,
    OnramperWidgetComponent,
    OnramperToAmountEstimatedComponent,
    SelectTokenButtonComponent,
    FiatAmountInputComponent,
    SelectFiatButtonComponent
  ],
  exports: [],
  imports: [
    CommonModule,
    OnramperExchangerRoutingModule,
    SwapsModule,
    SharedModule,
    SwapsSharedModule,
    SwapButtonContainerModule,
    TokensSelectorModule,
    ReactiveFormsModule,
    FiatsSelectorModule
  ]
})
export class OnramperExchangerModule {}
