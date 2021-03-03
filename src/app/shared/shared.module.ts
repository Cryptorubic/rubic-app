import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { DynamicModule } from 'ng-dynamic-component';
import { FooterComponent } from './components/footer/footer.component';
import { SpinnerComponent } from './components/spinner/spinner.component';
import { ArrowComponent } from './components/arrow/arrow.component';
import { MessageBoxComponent } from './components/message-box/message-box.component';

@NgModule({
  declarations: [FooterComponent, SpinnerComponent, ArrowComponent, MessageBoxComponent],
  imports: [CommonModule, TranslateModule, DynamicModule],
  exports: [FooterComponent, SpinnerComponent, ArrowComponent, MessageBoxComponent]
})
export class SharedModule {}
