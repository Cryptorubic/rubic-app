import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AirdropPageComponent } from '@features/airdrop/components/airdrop-page/airdrop-page.component';

const routes: Routes = [
  {
    path: '**',
    component: AirdropPageComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)]
})
export class AirdropRoutingModule {}
