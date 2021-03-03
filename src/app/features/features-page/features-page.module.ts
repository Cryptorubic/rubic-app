import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from 'src/app/shared/shared.module';
import { AboutageComponent } from './components/about/about.component';
import { FeaturePageRoutingModule } from './features-page-routing.module';

@NgModule({
  declarations: [AboutageComponent],
  imports: [CommonModule, TranslateModule, SharedModule, FeaturePageRoutingModule]
})
export class FeaturesPageModule {}
