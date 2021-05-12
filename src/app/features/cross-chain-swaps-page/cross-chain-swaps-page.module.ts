import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { InlineSVGModule } from 'ng-inline-svg';
import { CrossChainSwapsPageRoutingModule } from './cross-chain-swaps-page-routing.module';
import { CrossChainSwapsComponent } from './cross-chain-swaps/cross-chain-swaps.component';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  declarations: [CrossChainSwapsComponent],
  imports: [
    CommonModule,
    CrossChainSwapsPageRoutingModule,
    TranslateModule,
    SharedModule,
    InlineSVGModule
  ]
})
export class CrossChainSwapsPageModule {}
