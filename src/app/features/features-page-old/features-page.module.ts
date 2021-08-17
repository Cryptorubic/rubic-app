import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from 'src/app/shared/shared.module';
import { AboutPageComponent } from './components/about/about.component';
import { FeaturePageRoutingModule } from './features-page-routing.module';
import { InlineSVGModule } from 'ng-inline-svg';

@NgModule({
  declarations: [AboutPageComponent],
  imports: [CommonModule, TranslateModule, SharedModule, FeaturePageRoutingModule, InlineSVGModule]
})
export class FeaturesPageModule {}
