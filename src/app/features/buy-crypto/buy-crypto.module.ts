import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BuyCryptoComponent } from './components/buy-crypto/buy-crypto.component';
import { BuyCryptoRoutingModule } from './buy-crypto-routing.module';

@NgModule({
  declarations: [BuyCryptoComponent],
  imports: [CommonModule, BuyCryptoRoutingModule]
})
export class BuyCryptoModule {}
