import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HistoryViewComponent } from '@features/history/components/history-view/history-view.component';

const routes: Routes = [{ path: '', component: HistoryViewComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HistoryRoutingModule {}
