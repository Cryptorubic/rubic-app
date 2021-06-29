import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CryptoTapRoutingModule } from 'src/app/features/crypto-tap/crypto-tap-routing.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { CryptoTapFormService } from 'src/app/features/crypto-tap/services/crypto-tap-form-service/crypto-tap-form.service';
import { CryptoTapTokensService } from 'src/app/features/crypto-tap/services/crypto-tap-tokens-service/crypto-tap-tokens.service';
import { TokensSelectModule } from 'src/app/features/tokens-select/tokens-select.module';
import { CryptoTapService } from 'src/app/features/crypto-tap/services/crypto-tap-service/crypto-tap.service';
import { CryptoTapFormComponent } from './components/crypto-tap-form/crypto-tap-form.component';
import { CryptoTapTopFormComponent } from './components/crypto-tap-top-form/crypto-tap-top-form.component';
import { CryptoTapDiscountComponent } from './components/crypto-tap-discount/crypto-tap-discount.component';

@NgModule({
  declarations: [CryptoTapFormComponent, CryptoTapTopFormComponent, CryptoTapDiscountComponent],
  imports: [CommonModule, CryptoTapRoutingModule, SharedModule, TokensSelectModule],
  providers: [CryptoTapFormService, CryptoTapTokensService, CryptoTapService]
})
export class CryptoTapModule {}
