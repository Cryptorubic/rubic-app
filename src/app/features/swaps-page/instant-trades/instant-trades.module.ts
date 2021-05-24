import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { InstantTradesComponent } from './components/instant-trades/instant-trades.component';
import { InstantTradesFormComponent } from './components/instant-trades-form/instant-trades-form.component';
import { TradesModule } from '../trades-module/trades.module';
import { SharedModule } from '../../../shared/shared.module';
import { UniSwapService } from './services/uni-swap-service/uni-swap.service';
import { OneInchEthService } from './services/one-inch-service/one-inch-eth-service/one-inch-eth.service';
import { OneInchBscService } from './services/one-inch-service/one-inch-bsc-service/one-inch-bsc.service';
import { PancakeSwapService } from './services/pancake-swap-service/pancake-swap.service';
import { InstantTradesTableComponent } from './components/instant-trades-table/instant-trades-table.component';
import { QuickSwapService } from './services/quick-swap-service/quick-swap.service';
import { TokensSwapInputComponent } from './components/instant-trades-form/components/tokens-swap-input/tokens-swap-input.component';
import { ChainDropdownComponent } from './components/instant-trades-form/components/chain-dropdown/chain-dropdown.component';
import { IframeProfileComponent } from './components/instant-trades-form/components/iframe-profile/iframe-profile.component';
import { IframeTokensSwapInputComponent } from './components/instant-trades-form/components/iframe-tokens-swap-input/iframe-tokens-swap-input.component';

@NgModule({
  declarations: [
    InstantTradesComponent,
    InstantTradesFormComponent,
    InstantTradesTableComponent,
    TokensSwapInputComponent,
    IframeTokensSwapInputComponent,
    ChainDropdownComponent,
    IframeProfileComponent
  ],
  imports: [
    CommonModule,
    TradesModule,
    SharedModule,
    MatTooltipModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    FormsModule
  ],
  exports: [InstantTradesComponent],
  providers: [
    UniSwapService,
    OneInchBscService,
    OneInchEthService,
    QuickSwapService,
    PancakeSwapService
  ]
})
export class InstantTradesModule {}
