import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CryptoTapFormComponent } from 'src/app/features/crypto-tap/components/crypto-tap-form/crypto-tap-form.component';

const routes: Routes = [{ path: '', component: CryptoTapFormComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CryptoTapRoutingModule {}
