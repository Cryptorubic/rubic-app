import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ROUTE_PATH } from '@shared/constants/common/links';
import { RailgunMainPageComponent } from '@features/privacy/providers/railgun/components/railgun-main-page/railgun-main-page.component';

const routes: Routes = [
  {
    path: ROUTE_PATH.NONE,
    component: RailgunMainPageComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RailgunRoutingModule {}
