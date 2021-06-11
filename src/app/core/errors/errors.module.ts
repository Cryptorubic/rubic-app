import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { RubicErrorComponent } from './components/rubic-error/rubic-error.component';

@NgModule({
  declarations: [RubicErrorComponent],
  imports: [CommonModule, TranslateModule],
  entryComponents: [RubicErrorComponent]
})
export class ErrorsModule {}
