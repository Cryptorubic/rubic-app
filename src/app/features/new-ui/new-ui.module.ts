import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/shared/shared.module';
import { RouterModule, Routes } from '@angular/router';
import { TuiAvatarModule } from '@taiga-ui/kit';
import { TuiButtonModule, TuiHintModule, TuiSvgModule, TuiTooltipModule } from '@taiga-ui/core';

import { InstantTradeModule } from 'src/app/features/instant-trade/instant-trade.module';
import { BridgeModule } from 'src/app/features/bridge/bridge.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NewUiComponent } from './new-ui/new-ui.component';

const routes: Routes = [{ path: '', component: NewUiComponent }];

@NgModule({
  declarations: [NewUiComponent],
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    SharedModule,
    TuiAvatarModule,
    TuiButtonModule,
    InstantTradeModule,
    BridgeModule,
    TuiSvgModule,
    TuiTooltipModule,
    TuiHintModule,
    FormsModule,
    ReactiveFormsModule
  ],
  exports: [RouterModule]
})
export class NewUiModule {}
