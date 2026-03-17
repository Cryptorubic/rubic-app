import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  inject,
  Input,
  Output
} from '@angular/core';
import { StoreService } from '@core/services/store/store.service';
import { RailgunSupportedChain } from '@features/privacy/providers/railgun/constants/network-map';
import { blockchainIcon } from '@shared/constants/blockchain/blockchain-icon';
import { BlockchainName } from '@cryptorubic/core';
import { blockchainLabel } from '@shared/constants/blockchain/blockchain-label';
import { blockchainColor } from '@shared/constants/blockchain/blockchain-color';
import { fadeAnimation } from '@shared/utils/utils';
import { NAVIGATOR } from '@ng-web-apis/common';
import { timer } from 'rxjs';

interface UtxoChain {
  progress: number;
  icon: string;
  color: string;
  label: string;
  // chain: BlockchainName;
}

@Component({
  selector: 'app-railgun-account-info',
  templateUrl: './railgun-account-info.component.html',
  styleUrls: ['./railgun-account-info.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [fadeAnimation]
})
export class RailgunAccountInfoComponent {
  @Input({ required: true }) accountId: string;

  @Input({ required: true }) evmAddress: string;

  @Input({ required: true }) railgunAddress: string;

  public utxoChains: UtxoChain[] = [];

  public scanInProgress = true;

  public hintShown: boolean;

  private readonly navigator = inject(NAVIGATOR);

  private readonly cdr = inject(ChangeDetectorRef);

  @Input({ required: true }) set utxoScan(value: Record<RailgunSupportedChain, number>) {
    const chains = Object.entries(value).map(
      ([chain, nativeProgress]: [BlockchainName, number]) => {
        const icon = blockchainIcon[chain];
        const label = blockchainLabel[chain];
        const color = blockchainColor[chain];
        const progress = nativeProgress === 0 ? 100 : nativeProgress;

        return { icon, label, color, progress };
      }
    );
    this.utxoChains = chains;
    console.log(chains);

    const sum = chains.reduce((acc, curr) => acc + curr.progress, 0);
    this.scanInProgress = sum !== 0 && sum !== chains.length * 100;
  }

  @Output() handleLogout = new EventEmitter<void>();

  private readonly storeKey = 'RAILGUN_ENCRYPTION_CREDS_V1';

  private readonly storeService = inject(StoreService);

  public logout(): void {
    this.handleLogout.emit();
  }

  public copyToClipboard(value: string): void {
    this.showHint();
    this.navigator.clipboard.writeText(value);
  }

  private showHint(): void {
    this.hintShown = true;
    timer(1500).subscribe(() => {
      this.hintShown = false;
      this.cdr.markForCheck();
    });
  }
}
