import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/shared/shared.module';
import { GetBnbService } from 'src/app/features/cross-chain-swaps-page-old/get-bnb-page/services/get-bnb-service/get-bnb.service';
import { CrossChainSwapsPageModule } from 'src/app/features/cross-chain-swaps-page-old/cross-chain-swaps-page.module';
import { GetBnbPageRoutingModule } from './get-bnb-page-routing.module';
import { GetBnbComponent } from './components/get-bnb/get-bnb.component';
import { GetBnbFormComponent } from './components/get-bnb-form/get-bnb-form.component';

@NgModule({
  declarations: [GetBnbComponent, GetBnbFormComponent],
  imports: [CommonModule, GetBnbPageRoutingModule, SharedModule, CrossChainSwapsPageModule],
  providers: [GetBnbService]
})
export class GetBnbPageModule {}
