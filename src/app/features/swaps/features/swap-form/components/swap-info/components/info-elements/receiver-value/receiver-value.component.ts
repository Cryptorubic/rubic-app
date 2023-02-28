import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input } from '@angular/core';
import ADDRESS_TYPE from '@shared/models/blockchain/address-type';
import { BlockchainName } from 'rubic-sdk';

@Component({
  selector: 'app-receiver-value',
  templateUrl: './receiver-value.component.html',
  styleUrls: ['./receiver-value.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReceiverValueComponent {
  @Input() public readonly toWalletAddress: string;

  @Input() public readonly toBlockchain: BlockchainName;

  public isWalletCopied = false;

  public readonly ADDRESS_TYPE = ADDRESS_TYPE;

  constructor(private readonly cdr: ChangeDetectorRef) {}

  public handleCopyClick(): void {
    this.isWalletCopied = true;
    setTimeout(() => {
      this.isWalletCopied = false;
      this.cdr.markForCheck();
    }, 700);
  }
}
