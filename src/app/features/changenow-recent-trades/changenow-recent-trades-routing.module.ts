import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ChangenowRecentTradesComponent } from '@features/changenow-recent-trades/components/changenow-recent-trades/changenow-recent-trades.component';

const routes: Routes = [{ path: '', component: ChangenowRecentTradesComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)]
})
export class ChangenowRecentTradesRoutingModule {}
