import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TokensSelectComponent } from './components/tokens-select/tokens-select.component';
import { TokensSelectService } from './services/tokens-select.service';

@NgModule({
  declarations: [TokensSelectComponent],
  imports: [CommonModule],
  providers: [TokensSelectService],
  entryComponents: [TokensSelectComponent]
})
export class TokensSelectModule {}
