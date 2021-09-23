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
import { InlineSVGModule } from 'ng-inline-svg';
import { TokensSelectComponent } from './components/tokens-select/tokens-select.component';
import { TokensSelectService } from './services/tokens-select.service';
import { BlockchainsAsideComponent } from './components/blockchains-aside/blockchains-aside.component';
import { TokensSearchBarComponent } from './components/tokens-search-bar/tokens-search-bar.component';
import { TokensListComponent } from './components/tokens-list/tokens-list.component';
import { TokensListElementComponent } from './components/tokens-list-element/tokens-list-element.component';
import { SharedModule } from '../../shared/shared.module';
import { CustomTokenComponent } from './components/custom-token/custom-token.component';
import { CustomTokenWarningModalComponent } from './components/custom-token-warning-modal/custom-token-warning-modal.component';

@NgModule({
  declarations: [
    TokensSelectComponent,
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
    InlineSVGModule
  ],
  providers: [TokensSelectService],
  entryComponents: [TokensSelectComponent, CustomTokenWarningModalComponent]
})
export class TokensSelectModule {}
