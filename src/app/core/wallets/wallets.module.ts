import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WalletsModalService } from 'src/app/core/wallets/services/wallets-modal.service';
import { WalletsModalComponent } from 'src/app/core/wallets/components/wallets-modal/wallets-modal.component';
import { CoinbaseConfirmModalComponent } from 'src/app/core/wallets/components/coinbase-confirm-modal/coinbase-confirm-modal.component';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  declarations: [WalletsModalComponent, CoinbaseConfirmModalComponent],
  imports: [CommonModule, SharedModule],
  providers: [WalletsModalService],
  entryComponents: [WalletsModalComponent]
})
export class WalletsModule {}
