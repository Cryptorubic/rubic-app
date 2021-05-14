import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { InlineSVGModule } from 'ng-inline-svg';
import { SharedModule } from 'src/app/shared/shared.module';
import { CrossChainSwapsPageRoutingModule } from './cross-chain-swaps-page-routing.module';
import { CrossChainSwapsComponent } from './main-page/cross-chain-swaps.component';

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
