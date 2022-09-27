import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WalletsModalService } from 'src/app/core/wallets-modal/services/wallets-modal.service';
import { WalletsModalComponent } from 'src/app/core/wallets-modal/components/wallets-modal/wallets-modal.component';
import { CoinbaseConfirmModalComponent } from 'src/app/core/wallets-modal/components/coinbase-confirm-modal/coinbase-confirm-modal.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { IframeWalletsWarningComponent } from './components/iframe-wallets-warning/iframe-wallets-warning.component';
import { TuiScrollbarModule } from '@taiga-ui/core';

@NgModule({
  declarations: [
    WalletsModalComponent,
    CoinbaseConfirmModalComponent,
    IframeWalletsWarningComponent
  ],
  imports: [CommonModule, SharedModule, TuiScrollbarModule],
  providers: [WalletsModalService]
})
export class WalletsModalModule {}
