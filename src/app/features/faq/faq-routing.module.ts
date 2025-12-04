import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FaqViewComponent } from './components/faq-view/faq-view.component';

const routes: Routes = [{ path: '', component: FaqViewComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FaqRoutingModule {}
