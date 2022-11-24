import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OnramperExchangerComponent } from '@features/onramper-exchange/components/onramper-exchanger/onramper-exchanger.component';

const routes: Routes = [{ path: '', component: OnramperExchangerComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OnramperExchangerRoutingModule {}
