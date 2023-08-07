import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FacetsPageComponent } from '@features/facets/components/facets-page/facets-page.component';

const routes: Routes = [{ path: '', component: FacetsPageComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FacetsRoutingModule {}
