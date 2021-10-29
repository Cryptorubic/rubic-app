import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MyTradesPageComponent } from 'src/app/features/my-trades/my-trades-page.component';

const routes: Routes = [{ path: '', component: MyTradesPageComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)]
})
export class MyTradesRoutingModule {}
