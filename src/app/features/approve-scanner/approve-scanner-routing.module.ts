import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ApproveScannerPageComponent } from '@features/approve-scanner/components/approve-scanner-page/approve-scanner-page.component';
import { OverviewPageComponent } from '@features/approve-scanner/components/overview-page/overview-page.component';
import { LoginGuard } from '@shared/guards/login.guard';
import { ROUTE_PATH } from '@shared/constants/common/links';

const routes: Routes = [
  {
    path: 'revoke',
    component: ApproveScannerPageComponent,
    canActivate: [LoginGuard],
    data: { path: ROUTE_PATH.REVOKE_APPROVAL }
  },
  { path: '**', component: OverviewPageComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)]
})
export class ApproveScannerRoutingModule {}
