import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ApproveScannerPageComponent } from '@features/approve-scanner/components/approve-scanner-page/approve-scanner-page.component';

const routes: Routes = [{ path: '', component: ApproveScannerPageComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)]
})
export class ApproveScannerRoutingModule {}
