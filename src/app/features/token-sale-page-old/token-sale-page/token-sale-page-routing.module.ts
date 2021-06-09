import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TokenSaleComponent } from '../components/token-sale/token-sale.component';

const routes: Routes = [{ path: '', component: TokenSaleComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TokenSalePageRoutingModule {}
