import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WalletsModalService } from 'src/app/core/wallets/services/wallets-modal.service';
import { WalletsModalComponent } from 'src/app/core/wallets/components/wallets-modal/wallets-modal.component';
import { CoinbaseConfirmModalComponent } from 'src/app/core/wallets/components/coinbase-confirm-modal/coinbase-confirm-modal.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { IframeWalletsWarningComponent } from './components/iframe-wallets-warning/iframe-wallets-warning.component';

@NgModule({
  declarations: [
    WalletsModalComponent,
    CoinbaseConfirmModalComponent,
    IframeWalletsWarningComponent
  ],
  imports: [CommonModule, SharedModule],
  providers: [WalletsModalService],
  entryComponents: [WalletsModalComponent, IframeWalletsWarningComponent]
})
export class WalletsModule {}
