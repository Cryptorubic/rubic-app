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
import { TokensSelectComponent } from '@features/swaps/shared/components/tokens-select/components/tokens-select/tokens-select.component';
import { TokensSelectOpenerService } from '@features/swaps/shared/components/tokens-select/services/tokens-select-opener.service';
import { BlockchainsAsideComponent } from '@features/swaps/shared/components/tokens-select/components/blockchains-aside/blockchains-aside.component';
import { TokensSearchBarComponent } from '@features/swaps/shared/components/tokens-select/components/tokens-search-bar/tokens-search-bar.component';
import { TokensListComponent } from '@features/swaps/shared/components/tokens-select/components/tokens-list/tokens-list.component';
import { TokensListElementComponent } from '@features/swaps/shared/components/tokens-select/components/tokens-list/components/tokens-list-element/tokens-list-element.component';
import { SharedModule } from '@shared/shared.module';
import { CustomTokenComponent } from '@features/swaps/shared/components/tokens-select/components/tokens-list/components/custom-token/custom-token.component';
import { CustomTokenWarningModalComponent } from '@features/swaps/shared/components/tokens-select/components/tokens-list/components/custom-token-warning-modal/custom-token-warning-modal.component';
import { TuiAutoFocusModule } from '@taiga-ui/cdk';
import { BlockchainsListComponent } from 'src/app/features/swaps/shared/components/tokens-select/components/blockchains-list/blockchains-list.component';
import { BlockchainsListService } from '@features/swaps/shared/components/tokens-select/services/blockchains-list-service/blockchains-list.service';
import { TokensSelectService } from '@features/swaps/shared/components/tokens-select/services/tokens-select-service/tokens-select.service';
import { SwitchListTypeButtonComponent } from './components/switch-list-type-button/switch-list-type-button.component';
import { EmptyListComponent } from './components/tokens-list/components/empty-list/empty-list.component';

@NgModule({
  declarations: [
    TokensSelectComponent,
    BlockchainsAsideComponent,
    TokensSearchBarComponent,
    TokensListComponent,
    TokensListElementComponent,
    CustomTokenComponent,
    CustomTokenWarningModalComponent,
    BlockchainsListComponent,
    SwitchListTypeButtonComponent,
    EmptyListComponent
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
  ],
  providers: [TokensSelectOpenerService, TokensSelectService, BlockchainsListService]
})
export class TokensSelectModule {}
