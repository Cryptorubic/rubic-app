import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@shared/shared.module';
import { Zkp2pRoutingModule } from './zkp2p-routing.module';
import { Zkp2pFormComponent } from './components/zkp2p-form/zkp2p-form.component';
import { Zkp2pTokensSelectorComponent } from './components/zkp2p-tokens-selector/zkp2p-tokens-selector.component';
import { AssetsSelectorModule } from '../trade/components/assets-selector/assets-selector.module';
import { Zkp2pService } from './services/zkp2p.service';
import { SharedTradeModule } from '../trade/shared-trade.module';
import { TuiButtonModule } from '@taiga-ui/core';

@NgModule({
  declarations: [Zkp2pFormComponent, Zkp2pTokensSelectorComponent],
  imports: [
    CommonModule,
    Zkp2pRoutingModule,
    SharedModule,
    AssetsSelectorModule,
    SharedTradeModule,
    TuiButtonModule
  ],
  providers: [Zkp2pService]
})
export class Zkp2pModule {}
