import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GetBnbPageRoutingModule } from './get-bnb-page-routing.module';
import { GetBnbComponent } from './components/get-bnb/get-bnb.component';
import { GetBnbFormComponent } from './components/get-bnb-form/get-bnb-form.component';
import { SharedModule } from '../../../shared/shared.module';

@NgModule({
  declarations: [GetBnbComponent, GetBnbFormComponent],
  imports: [CommonModule, GetBnbPageRoutingModule, SharedModule]
})
export class GetBnbPageModule {}
