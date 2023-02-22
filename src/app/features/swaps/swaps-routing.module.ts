import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SwapFormComponent } from '@features/swaps/features/swap-form/swap-form.component';
import { ChangenowPostFormComponent } from '@features/swaps/features/post-form/components/changenow-post-form/changenow-post-form.component';

const routes: Routes = [
  { path: '', component: SwapFormComponent },
  { path: 'changenow-post', component: ChangenowPostFormComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SwapsRoutingModule {}
