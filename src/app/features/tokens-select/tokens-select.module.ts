import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TuiScrollbarModule, TuiSvgModule, TuiTextfieldControllerModule } from '@taiga-ui/core';
import { TuiInputModule } from '@taiga-ui/kit';
import { FormsModule } from '@angular/forms';
import { TokensSelectComponent } from './components/tokens-select/tokens-select.component';
import { TokensSelectService } from './services/tokens-select.service';
import { BlockchainsAsideComponent } from './components/blockchains-aside/blockchains-aside.component';
import { TokensSearchBarComponent } from './components/tokens-search-bar/tokens-search-bar.component';
import { TokensListComponent } from './components/tokens-list/tokens-list.component';
import { TokensListElementComponent } from './components/tokens-list-element/tokens-list-element.component';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  declarations: [
    TokensSelectComponent,
    BlockchainsAsideComponent,
    TokensSearchBarComponent,
    TokensListComponent,
    TokensListElementComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    TuiScrollbarModule,
    TuiInputModule,
    FormsModule,
    TuiTextfieldControllerModule,
    TuiSvgModule
  ],
  providers: [TokensSelectService],
  entryComponents: [TokensSelectComponent]
})
export class TokensSelectModule {}
