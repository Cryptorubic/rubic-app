import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { RubicErrorComponent } from './components/rubic-error/rubic-error.component';
import { NotSupportedNetworkErrorComponent } from './components/not-supported-network-error/not-supported-network-error.component';

@NgModule({
  declarations: [RubicErrorComponent, NotSupportedNetworkErrorComponent],
  imports: [CommonModule, TranslateModule],
  entryComponents: [RubicErrorComponent, NotSupportedNetworkErrorComponent]
})
export class ErrorsModule {}
