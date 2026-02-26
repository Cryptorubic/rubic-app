import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'hinkal',
    loadChildren: () => import('./providers/hinkal/hinkal.module').then(m => m.HinkalModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  providers: [],
  exports: [RouterModule]
})
export class PrivacyRoutingModule {}
