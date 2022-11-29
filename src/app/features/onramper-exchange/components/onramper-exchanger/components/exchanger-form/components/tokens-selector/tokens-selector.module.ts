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
import { TokensSelectorComponent } from '@features/onramper-exchange/components/onramper-exchanger/components/exchanger-form/components/tokens-selector/components/tokens-selector/tokens-selector.component';
import { CustomTokenWarningModalComponent } from '@features/onramper-exchange/components/onramper-exchanger/components/exchanger-form/components/tokens-selector/components/custom-token-warning-modal/custom-token-warning-modal.component';
import { CustomTokenComponent } from '@features/onramper-exchange/components/onramper-exchanger/components/exchanger-form/components/tokens-selector/components/custom-token/custom-token.component';
import { BlockchainsAsideComponent } from '@features/onramper-exchange/components/onramper-exchanger/components/exchanger-form/components/tokens-selector/components/blockchains-aside/blockchains-aside.component';
import { TokensSearchBarComponent } from '@features/onramper-exchange/components/onramper-exchanger/components/exchanger-form/components/tokens-selector/components/tokens-search-bar/tokens-search-bar.component';
import { TokensListComponent } from '@features/onramper-exchange/components/onramper-exchanger/components/exchanger-form/components/tokens-selector/components/tokens-list/tokens-list.component';
import { TokensListElementComponent } from '@features/onramper-exchange/components/onramper-exchanger/components/exchanger-form/components/tokens-selector/components/tokens-list-element/tokens-list-element.component';

@NgModule({
  declarations: [
    TokensSelectorComponent,
    BlockchainsAsideComponent,
    TokensSearchBarComponent,
    TokensListComponent,
    TokensListElementComponent,
    CustomTokenComponent,
    CustomTokenWarningModalComponent
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
export class TokensSelectorModule {}
