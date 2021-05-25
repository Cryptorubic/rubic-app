import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BridgeComponent } from './components/bridge/bridge.component';

const routes: Routes = [{ path: '', component: BridgeComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BridgePageRoutingModule {}
