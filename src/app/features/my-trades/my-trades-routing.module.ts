import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MyTradesComponent } from 'src/app/features/my-trades/components/my-trades/my-trades.component';

const routes: Routes = [{ path: '', component: MyTradesComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)]
})
export class MyTradesRoutingModule {}
