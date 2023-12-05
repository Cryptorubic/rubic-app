import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RetrodropPageComponent } from '@features/retrodrop/components/retrodrop-page/retrodrop-page.component';

const routes: Routes = [
  {
    path: '',
    component: RetrodropPageComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)]
})
export class RetrodropRoutingModule {}
