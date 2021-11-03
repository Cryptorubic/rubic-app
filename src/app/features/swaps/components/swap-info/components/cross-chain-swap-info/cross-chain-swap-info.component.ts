import { Component, ChangeDetectionStrategy, Input, ChangeDetectorRef } from '@angular/core';
import { SWAP_PROVIDER_TYPE } from '@features/swaps/models/SwapProviderType';
import { BLOCKCHAIN_NAME } from '@shared/models/blockchain/BLOCKCHAIN_NAME';
import ADDRESS_TYPE from '@shared/models/blockchain/ADDRESS_TYPE';

@Component({
  selector: 'app-cross-chain-swap-info',
  templateUrl: './cross-chain-swap-info.component.html',
  styleUrls: ['./cross-chain-swap-info.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CrossChainSwapInfoComponent {
  @Input() public swapType: SWAP_PROVIDER_TYPE;

  public readonly SWAP_PROVIDER_TYPE = SWAP_PROVIDER_TYPE;

  public readonly ADDRESS_TYPE = ADDRESS_TYPE;

  public toBlockchain: BLOCKCHAIN_NAME;

  public isWalletCopied: boolean;

  constructor(private readonly cdr: ChangeDetectorRef) {
    this.isWalletCopied = false;
  }

  public onWalletAddressCopied(): void {
    this.isWalletCopied = true;
    setTimeout(() => {
      this.isWalletCopied = false;
      this.cdr.markForCheck();
    }, 700);
  }
}
