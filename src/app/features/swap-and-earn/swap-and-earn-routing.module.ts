import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SwapAndEarnPageComponent } from '@features/swap-and-earn/components/swap-and-earn-page/swap-and-earn-page.component';

const routes: Routes = [
  {
    path: '**',
    component: SwapAndEarnPageComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)]
})
export class SwapAndEarnRoutingModule {}
