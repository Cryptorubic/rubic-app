import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SwapsFormComponent } from 'src/app/features/swaps/features/main-form/components/swaps-form/swaps-form.component';

const routes: Routes = [{ path: '', component: SwapsFormComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SwapsRoutingModule {}
