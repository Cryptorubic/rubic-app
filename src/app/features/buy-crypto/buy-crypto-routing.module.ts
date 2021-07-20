import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { BuyCryptoComponent } from './components/buy-crypto/buy-crypto.component';

const routes: Routes = [{ path: '', component: BuyCryptoComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BuyCryptoRoutingModule {}
