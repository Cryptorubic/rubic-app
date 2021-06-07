import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/shared/shared.module';
import { RouterModule, Routes } from '@angular/router';
import { TuiAvatarModule } from '@taiga-ui/kit';
import { TuiButtonModule } from '@taiga-ui/core';
import { NewUiComponent } from './new-ui/new-ui.component';

const routes: Routes = [{ path: '', component: NewUiComponent }];

@NgModule({
  declarations: [NewUiComponent],
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    SharedModule,
    TuiAvatarModule,
    TuiButtonModule
  ],
  exports: [RouterModule]
})
export class NewUiModule {}
