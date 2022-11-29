import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  TuiButtonModule,
  TuiHintModule,
  TuiLoaderModule,
  TuiManualHintModule,
  TuiScrollbarModule,
  TuiSvgModule,
  TuiTextfieldControllerModule
} from '@taiga-ui/core';
import { TuiInputModule } from '@taiga-ui/kit';
import { FormsModule } from '@angular/forms';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { InlineSVGModule } from 'ng-inline-svg-2';
import { TuiAutoFocusModule } from '@taiga-ui/cdk';
import { SharedModule } from '@shared/shared.module';
import { FiatsSelectorComponent } from '@features/onramper-exchange/components/onramper-exchanger/components/exchanger-form/components/fiat-amount-input/components/fiats-selector/components/fiats-selector/fiats-selector.component';
import { FiatsSearchBarComponent } from '@features/onramper-exchange/components/onramper-exchanger/components/exchanger-form/components/fiat-amount-input/components/fiats-selector/components/fiats-search-bar/fiats-search-bar.component';
import { FiatsListComponent } from '@features/onramper-exchange/components/onramper-exchanger/components/exchanger-form/components/fiat-amount-input/components/fiats-selector/components/fiats-list/fiats-list.component';
import { FiatsListElementComponent } from '@features/onramper-exchange/components/onramper-exchanger/components/exchanger-form/components/fiat-amount-input/components/fiats-selector/components/fiats-list-element/fiats-list-element.component';

@NgModule({
  declarations: [
    FiatsSelectorComponent,
    FiatsSearchBarComponent,
    FiatsListComponent,
    FiatsListElementComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    TuiScrollbarModule,
    TuiInputModule,
    FormsModule,
    TuiTextfieldControllerModule,
    TuiSvgModule,
    TuiButtonModule,
    ScrollingModule,
    TuiHintModule,
    TuiManualHintModule,
    TuiLoaderModule,
    InlineSVGModule,
    TuiAutoFocusModule
  ]
})
export class FiatsSelectorModule {}
