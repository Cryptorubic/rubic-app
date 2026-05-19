import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HoudiniMainPageComponent } from './components/houdini-main-page/houdini-main-page.component';

const routes: Routes = [{ path: '', component: HoudiniMainPageComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HoudiniRoutingModule {}
