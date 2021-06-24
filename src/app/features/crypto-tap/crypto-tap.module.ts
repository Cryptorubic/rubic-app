import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CryptoTapRoutingModule } from 'src/app/features/crypto-tap/crypto-tap-routing.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { CryptoTapFormService } from 'src/app/features/crypto-tap/services/crypto-tap-form-service/crypto-tap-form.service';
import { CryptoTapTokensService } from 'src/app/features/crypto-tap/services/crypto-tap-tokens-service/crypto-tap-tokens.service';
import { TokensSelectModule } from 'src/app/features/tokens-select/tokens-select.module';
import { CryptoTapFormComponent } from './components/crypto-tap-form/crypto-tap-form.component';

@NgModule({
  declarations: [CryptoTapFormComponent],
  imports: [CommonModule, CryptoTapRoutingModule, SharedModule, TokensSelectModule],
  providers: [CryptoTapFormService, CryptoTapTokensService]
})
export class CryptoTapModule {}
